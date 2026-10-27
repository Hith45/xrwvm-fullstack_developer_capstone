from django.urls import path
from . import views

app_name = "djangoapp"

urlpatterns = [
    path("login", views.login_user, name="login"),
    path("logout", views.logout_request, name="logout"),
    path("registration", views.registration, name="registration"),

    # Dealer endpoints
    path("get_dealers", views.get_dealerships, name="get_dealers"),
    path("getalldealers", views.getalldealers, name="getalldealers"),
    path("getdealer/<int:dealer_id>", views.getdealerbyid, name="getdealerbyid"),
    path("getdealers/<str:state>", views.getdealersbystate, name="getdealersbystate"),

    # Reviews and car data
    path(
        "get_dealer_reviews/<int:dealer_id>",
        views.get_dealer_reviews,
        name="get_dealer_reviews",
    ),
    path("getallcarmakes", views.getallcarmakes, name="getallcarmakes"),
    path("analyze_review", views.analyze_review, name="analyze_review"),
    path("add_review", views.add_review, name="add_review"),
]
