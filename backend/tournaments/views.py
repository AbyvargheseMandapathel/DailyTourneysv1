from django.http import FileResponse
from rest_framework import viewsets, permissions, status, exceptions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Tournament, Match, Score, Team, FeaturedContent, TournamentTheme
from .serializers import (
    TournamentSerializer, MatchSerializer, ScoreSerializer, TeamSerializer, 
    FeaturedContentSerializer, TournamentThemeSerializer
)
from .permissions import IsOrganiserOrReadOnly
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsOrganiserOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        tournament = self.get_object()
        match_id = request.query_params.get('match_id')

        teams = tournament.teams.all()
        leaderboard = []
        for team in teams:
            scores = Score.objects.filter(team=team, match__tournament=tournament)
            if match_id:
                scores = scores.filter(match_id=match_id)
            
            total_points = sum(s.total_points for s in scores)
            total_kills = sum(s.kills for s in scores)
            total_wwcd = scores.filter(placement=1).count()
            total_position_points = total_points - total_kills

            leaderboard.append({
                "team_id": team.id,
                "team_name": team.name,
                "team_logo": team.logo.url if team.logo else None,
                "total_points": total_points,
                "total_kills": total_kills,
                "total_wwcd": total_wwcd,
                "total_position_points": total_position_points
            })
        
        # Sort by Total Points (desc), then WWCD (desc), then Position Points (desc)
        leaderboard.sort(key=lambda x: (x['total_points'], x['total_wwcd'], x['total_position_points']), reverse=True)
        return Response(leaderboard)

    @action(detail=True, methods=['get'])
    @action(detail=True, methods=['get'])
    def generate_image(self, request, pk=None):
        tournament = self.get_object()
        
        # Determine Theme
        theme_id = request.query_params.get('theme_id')
        theme = None
        if theme_id:
            from .models import TournamentTheme
            theme = TournamentTheme.objects.filter(id=theme_id, tournament=tournament).first()
        
        # Fallback to first theme or legacy fields
        if not theme:
            theme = tournament.themes.first() # Try to get first defined theme
        
        # If still no theme, check legacy fields or error
        image_path = None
        config = {}
        teams_per_page = 20
        custom_font_path = None
        
        if theme:
            if not theme.theme_image:
                 return Response({"error": "Selected theme has no image."}, status=400)
            image_path = theme.theme_image.path
            config = theme.layout_config or {}
            teams_per_page = theme.teams_per_page
            if theme.custom_font:
                custom_font_path = theme.custom_font.path
        elif tournament.theme_image:
            # Legacy fallback
            image_path = tournament.theme_image.path
            config = tournament.layout_config or {}
        else:
             return Response({"error": "No theme image found."}, status=400)

        # 1. Fetch Leaderboard Data
        match_id = request.query_params.get('match_id')
        teams = tournament.teams.all()
        leaderboard_data = []
        for team in teams:
            scores = Score.objects.filter(team=team, match__tournament=tournament)
            if match_id:
                scores = scores.filter(match_id=match_id)
            
            total_points = sum(s.total_points for s in scores)
            total_kills = sum(s.kills for s in scores)
            total_wwcd = scores.filter(placement=1).count()
            total_position_points = total_points - total_kills
            
            leaderboard_data.append({
                "team_name": team.name,
                "team_logo": team.logo, # Pass the ImageField file object
                "wwcd": total_wwcd,
                "matches": scores.values('match').distinct().count(),
                "pos_pts": total_position_points,
                "fin_pts": total_kills,
                "total": total_points
            })
        
        leaderboard_data.sort(key=lambda x: (x['total'], x['wwcd'], x['pos_pts']), reverse=True)

        # 2. Pagination Logic
        page = int(request.query_params.get('page', 1))
        start_index = (page - 1) * teams_per_page
        end_index = start_index + teams_per_page
        page_data = leaderboard_data[start_index:end_index] # Slice data

        if not page_data and page > 1:
             return Response({"error": "Page out of range"}, status=400)

            # Generate Image using Helper
            from PIL import Image, ImageDraw, ImageFont, ImageOps
            import io

            image_buffer = self.create_leaderboard_image(
                tournament, 
                theme, 
                page_data, 
                start_index
            )
            
            filename = f"leaderboard_{tournament.id}_p{page}.png"
            return FileResponse(image_buffer, as_attachment=True, filename=filename)

        except Exception as e:
            print(f"Image Gen Error: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['get'])
    def generate_zip(self, request, pk=None):
        tournament = self.get_object()
        
        # 1. Gather Data (Similar to generate_image)
        scores = Score.objects.filter(match__tournament=tournament)
        teams = {}
        
        # Aggregate logic (copied from generate_image - ideally should be helper)
        for score in scores:
            tid = score.team.id
            if tid not in teams:
                teams[tid] = {
                    'team_name': score.team.name,
                    'team_logo': score.team.logo,
                    'matches': 0,
                    'total_kills': 0,
                    'total_position_points': 0,
                    'total_wwcd': 0,
                    'total_points': 0
                }
            
            teams[tid]['matches'] += 1
            teams[tid]['total_kills'] += score.kills
            teams[tid]['total_position_points'] += (score.total_points - score.kills)
            if score.placement == 1:
                teams[tid]['total_wwcd'] += 1
            teams[tid]['total_points'] += score.total_points
            
        leaderboard_data = sorted(teams.values(), key=lambda x: x['total_points'], reverse=True)
        
        # Resolve Theme
        theme_id = request.query_params.get('theme_id')
        theme = None
        if theme_id:
            try:
                theme = TournamentTheme.objects.get(id=theme_id, tournament=tournament)
            except TournamentTheme.DoesNotExist:
                return Response({'error': 'Theme not found'}, status=404)
        
        # Resolve Config & Pagination
        if theme:
            teams_per_page = theme.teams_per_page or 20
        else:
            teams_per_page = 20

        import math
        total_pages = math.ceil(len(leaderboard_data) / teams_per_page)
        if total_pages == 0: total_pages = 1

        import zipfile
        import io
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, 'w') as zf:
            for page in range(1, total_pages + 1):
                start_index = (page - 1) * teams_per_page
                end_index = start_index + teams_per_page
                page_data = leaderboard_data[start_index:end_index]
                
                try:
                     image_buffer = self.create_leaderboard_image(
                        tournament, 
                        theme, 
                        page_data, 
                        start_index
                     )
                     zf.writestr(f"leaderboard_p{page}.png", image_buffer.getvalue())
                except Exception as e:
                     print(f"Error generating page {page} for zip: {e}")
                     # Continue to next page rather than failing entire zip? 
                     pass

        zip_buffer.seek(0)
        filename = f"leaderboard_{tournament.id}_all.zip"
        return FileResponse(zip_buffer, as_attachment=True, filename=filename)


    def create_leaderboard_image(self, tournament, theme, page_data, start_index):
        from PIL import Image, ImageDraw, ImageFont, ImageOps
        import io
        import os
        from django.conf import settings

        # Config Logic (from generate_image)
        if theme:
            config = theme.layout_config or {}
            
            # Handle Image Path
            image_field = theme.theme_image
            if image_field:
                 image_path = image_field.path
            elif tournament.theme_image:
                 image_path = tournament.theme_image.path
            else:
                 # Fallback
                 from django.contrib.staticfiles import finders
                 image_path = finders.find('default_leaderboard.jpg')
                 if not image_path:
                     # Create blank image
                    pass 
        else:
            config = tournament.layout_config or {}
            if tournament.theme_image:
                image_path = tournament.theme_image.path
            else:
                 # Fallback
                 image_path = "default_leaderboard.jpg" # Dummy

        # Custom Font Logic
        custom_font_path = None
        if theme and theme.custom_font:
             custom_font_path = theme.custom_font.path

        # If image path not found/valid, create blank
        try:
             base_image = Image.open(image_path).convert("RGBA")
        except:
             base_image = Image.new('RGBA', (1920, 1080), (0,0,0,0))

        draw = ImageDraw.Draw(base_image)
        
        # Defaults
        start_x = int(config.get('start_x', 100))
        start_y = int(config.get('start_y', 300))
        row_height = int(config.get('row_height', 50))
        font_size = int(config.get('font_size', 40))
        font_color = config.get('font_color', '#FFFFFF')
        try:
            stroke_width = int(config.get('font_weight', 0))
        except (ValueError, TypeError):
            stroke_width = 0

        logo_size = int(config.get('logo_size', 40))
        logo_y_offset = int(config.get('logo_y_offset', 0))
        cols = config.get('columns', {})

        # Font Loading
        font = None
        if custom_font_path:
            try:
                font = ImageFont.truetype(custom_font_path, font_size)
            except Exception as e:
                print(f"Font Load Error: {e}")
        
        if not font:
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except IOError:
                font = ImageFont.load_default()

        # Drawing Loop
        current_y = start_y
        for index, team in enumerate(page_data):
            rank = start_index + index + 1
            
            # Draw Rank
            if 'rank' in cols or not cols: 
                col_rank = int(cols.get('rank', 0 if not cols else -9999))
                if col_rank != -9999:
                        draw.text((start_x + col_rank, current_y), str(rank), font=font, fill=font_color, stroke_width=stroke_width, stroke_fill=font_color)

            # Draw Logo
            if 'logo' in cols:
                    col_logo = int(cols.get('logo'))
                    if team['team_logo']:
                        try:
                            logo_img = Image.open(team['team_logo'].path).convert("RGBA")
                            logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                            base_logo_y = current_y + (row_height - logo_size) // 2
                            logo_y = base_logo_y + logo_y_offset
                            base_image.paste(logo_img, (start_x + col_logo, logo_y), logo_img)
                        except Exception as e:
                            print(f"Error drawing logo for team {team['team_name']}: {e}")

            # Draw Team Name
            if 'team' in cols or not cols:
                draw.text((start_x + int(cols.get('team', 100)), current_y), str(team['team_name']), font=font, fill=font_color, stroke_width=stroke_width, stroke_fill=font_color)
            
            # Draw Stats
            if 'wwcd' in cols or not cols:
                draw.text((start_x + int(cols.get('wwcd', 500)), current_y), str(team['wwcd']), font=font, fill=font_color, stroke_width=stroke_width, stroke_fill=font_color)

            if 'matches' in cols or not cols:
                draw.text((start_x + int(cols.get('matches', 650)), current_y), str(team.get('matches', 0)), font=font, fill=font_color, stroke_width=stroke_width, stroke_fill=font_color)
            
            if 'pos_pts' in cols or not cols:
                draw.text((start_x + int(cols.get('pos_pts', 800)), current_y), str(team['pos_pts']), font=font, fill=font_color, stroke_width=stroke_width, stroke_fill=font_color)
            
            if 'fin_pts' in cols or not cols:
                draw.text((start_x + int(cols.get('fin_pts', 950)), current_y), str(team['fin_pts']), font=font, fill=font_color, stroke_width=stroke_width, stroke_fill=font_color)
            
            if 'total' in cols or not cols:
                draw.text((start_x + int(cols.get('total', 1100)), current_y), str(team['total']), font=font, fill=font_color, stroke_width=stroke_width, stroke_fill=font_color)

            current_y += row_height

        buffer = io.BytesIO()
        base_image.save(buffer, format="PNG")
        buffer.seek(0)
        return buffer

class TournamentThemeViewSet(viewsets.ModelViewSet):
    queryset = TournamentTheme.objects.all()
    serializer_class = TournamentThemeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        # Ensure tournament belongs to user? Or just standard permission check
        # For now, MVP: assume authenticated user can create theme for any tournament they have access to
        serializer.save()

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsOrganiserOrReadOnly]

    def perform_create(self, serializer):
        tournament = serializer.validated_data['tournament']
        if tournament.creator != self.request.user and not self.request.user.role == 'ADMIN' and not self.request.user.is_superuser:
             raise exceptions.PermissionDenied("You are not the creator of this tournament.")
        team = serializer.save()
        team.members.add(self.request.user)

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsOrganiserOrReadOnly]

    def perform_create(self, serializer):
        tournament = serializer.validated_data['tournament']
        if tournament.creator != self.request.user and not self.request.user.role == 'ADMIN' and not self.request.user.is_superuser:
             raise exceptions.PermissionDenied("You are not the creator of this tournament.")
        serializer.save()

class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    permission_classes = [IsOrganiserOrReadOnly]

    def create(self, request, *args, **kwargs):
        try:
            # Custom logic to handle "Update if exists"
            match_id = request.data.get('match')
            team_id = request.data.get('team')
            
            # Check if score already exists
            try:
                instance = Score.objects.get(match_id=match_id, team_id=team_id)
                # If exists, update it
                serializer = self.get_serializer(instance, data=request.data)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer) # Reuse perform_update logic
                return Response(serializer.data)
            except Score.DoesNotExist:
                # If not, create standard
                return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e), "detail": traceback.format_exc()}, status=400)

    def perform_create(self, serializer):
        match = serializer.validated_data['match']
        if match.tournament.creator != self.request.user and not self.request.user.role == 'ADMIN' and not self.request.user.is_superuser:
             raise exceptions.PermissionDenied("You are not the creator of this tournament.")
        score = serializer.save()
        self.trigger_update(score)

    def perform_update(self, serializer):
        score = serializer.save()
        self.trigger_update(score)
    
    def perform_destroy(self, instance):
        self.trigger_update(instance)
        instance.delete()

    def trigger_update(self, score_instance):
        channel_layer = get_channel_layer()
        tournament_id = score_instance.match.tournament.id
        async_to_sync(channel_layer.group_send)(
            f"tournament_{tournament_id}_leaderboard",
            {
                "type": "leaderboard_update",
                "message": "Leaderboard updated"
            }
        )

class FeaturedContentViewSet(viewsets.ModelViewSet):
    queryset = FeaturedContent.objects.filter(active=True).order_by('-priority', '-id')
    serializer_class = FeaturedContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Allow read for all, write for auth? Or admin only?
    # For MVP: Admin/Organiser only write check is needed ideally, but IsAuthenticatedOrReadOnly covers 'superuser can add' via admin panel anyway if using API. 
    # But if adding via frontend dashboard? 'superuser can add from dashboard' -> implies frontend dashboard.
    # So we need write permission for admin.
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
