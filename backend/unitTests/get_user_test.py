import pytest
from flask import jsonify
from app import app, db
from models import User
from flask.testing import FlaskClient
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

@pytest.fixture
def client():
    """Creates a test client for the Flask app."""
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:" # dummy db for testing
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


@pytest.fixture
def create_test_users(client):
    with app.app_context():
        """Creates test users in the database."""
    user1 = User(
        name="John",
        surname="Doe",
        username="johndoe",
        email="john@example.com",
        password=bcrypt.generate_password_hash("oldpassword").decode("utf-8"),
        occupation="Developer",
        gender="male",
        image_url="https://example.com/avatar1.png"
    )

    user2 = User(
        name="Alice",
        surname="Smith",
        username="alice123",
        email="alice@example.com",
        password=bcrypt.generate_password_hash("securepass").decode("utf-8"),
        occupation="Designer",
        gender="female",
        image_url="https://example.com/avatar2.png"
    )

    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()
    
    return user1, user2


def test_get_all_users(client, create_test_users):
    """Test retrieving all users."""
    user1, user2 = create_test_users

    response = client.get("/api/users")
    
    assert response.status_code == 200
    data = response.get_json()
    
    assert isinstance(data, list)
    assert len(data) == 2
    assert "id" in data[0]
    assert "name" in data[0]
    assert "email" in data[0]
    assert data[0]["id"] == user1.id
    assert data[1]["id"] == user2.id


def test_get_current_user(client, create_test_users):
    """Test retrieving the current user."""
    user1, _ = create_test_users

    with client.session_transaction() as session:
        # current user
        session["user_id"] = user1.id  
    
    response = client.get("/api/users/@me")
    
    assert response.status_code == 200
    data = response.get_json()
    
    assert data["id"] == user1.id
    assert data["name"] == user1.name
    assert data["surname"] == user1.surname
    assert data["email"] == user1.email
    assert data["username"] == user1.username
    assert data["occupation"] == user1.occupation
    assert data["img_url"] == user1.image_url


def test_get_current_user_not_logged_in(client):
    """Test retrieving the current user when not logged in."""
    response = client.get("/api/users/@me")
    
    # Unauthorized
    assert response.status_code == 401  
    data = response.get_json()
    
    assert "error" in data
    assert data["error"] == "Unauthorized"
