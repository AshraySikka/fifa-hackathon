from django.contrib.auth.models import User
from django.db import models


class Bar(models.Model):
    VIBE_CHOICES = [
        ("casual", "Casual"),
        ("rowdy", "Rowdy"),
        ("family", "Family-friendly"),
    ]

    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300)
    phone = models.CharField(max_length=30, blank=True)
    rating = models.FloatField(default=0)
    hours = models.CharField(max_length=200, blank=True, help_text="e.g. Mon-Sun 11am-2am")
    lat = models.FloatField()
    lng = models.FloatField()
    vibe = models.CharField(max_length=20, choices=VIBE_CHOICES, default="casual")
    # Comma-separated country/team names this bar's crowd tends to support,
    # e.g. "Canada,Portugal,Brazil". Kept as a simple CharField so hackathon
    # fixtures stay editable without needing a M2M through-table.
    team_tags = models.CharField(max_length=300, blank=True)
    google_place_id = models.CharField(max_length=120, blank=True, null=True, unique=False)
    source = models.CharField(max_length=20, default="seed")  # "seed" or "google_places"

    def __str__(self):
        return self.name


class Match(models.Model):
    team_a = models.CharField(max_length=100)
    team_b = models.CharField(max_length=100)
    date = models.DateField()
    time = models.TimeField()
    venue = models.CharField(max_length=200)

    class Meta:
        ordering = ["date", "time"]

    def __str__(self):
        return f"{self.team_a} vs {self.team_b} ({self.date})"


class ChatRoom(models.Model):
    KIND_CHOICES = [("nearby", "Nearby"), ("global", "Global")]

    # "nearby" rooms use a coordinate-grid code like "NEARBY-43.65--79.38"
    # so anyone whose rounded location matches lands in the same room
    # automatically. "global" rooms use a short random invite code.
    code = models.CharField(max_length=40, unique=True)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.kind} room {self.code}"


class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    # Kept as a plain string rather than a User FK -- chat should work for
    # guests who haven't signed up, not just logged-in fans tagging bars.
    sender_name = models.CharField(max_length=60)
    text = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender_name}: {self.text[:40]}"


class ScreeningTag(models.Model):
    bar = models.ForeignKey(Bar, on_delete=models.CASCADE, related_name="screening_tags")
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="screening_tags")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="screening_tags")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("bar", "match", "user")

    def __str__(self):
        return f"{self.bar.name} screening {self.match}"
