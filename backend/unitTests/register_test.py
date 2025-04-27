import pytest
from flask import json
from app import app, db
from models import User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


@pytest.fixture
def client():
    """Creates a test client for the Flask app."""
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # Use in-memory DB for tests
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


@pytest.fixture
def create_test_user(client):
    """Creates a user in the test database."""
    hashed_password = bcrypt.generate_password_hash("testpassword").decode("utf-8")
    user = User(
        name="Test",
        surname="User",
        username="testuser",
        email="test@example.com",
        password=hashed_password,
        occupation="Tester",
        gender="male",
        image_url="https://example.com/avatar.png"
    )
    db.session.add(user)
    db.session.commit()
    return user


def test_register_missing_field(client):
    """Test user registration fails when a required field is missing."""
    payload = {
        "name": "John",
        "surname": "Doe",
        "username": "johndoe",
        "password": "securepass",
        "occupation": "Developer",
        "gender": "male"
        # Missing "email"
    }
    response = client.post("/api/users/register", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    assert "Missing required field: email" in response.json["error"]


def test_register_existing_username(client, create_test_user):
    """Test user registration fails when username is already taken."""
    payload = {
        "name": "John",
        "surname": "Doe",
        "username": "testuser",  # Same username as created in fixture
        "email": "john@example.com",
        "password": "securepass",
        "occupation": "Developer",
        "gender": "male"
    }
    response = client.post("/api/users/register", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 409
    assert "Username testuser is already exist" in response.json["error"]


@pytest.mark.skip(reason="there is no email check for the bakcend side, it is done in frontend")
def test_register_invalid_email(client):
    """Test user registration fails when email format is invalid."""
    payload = {
        "name": "Alice",
        "surname": "Smith",
        "username": "alice123",
        "email": "invalid-email",  # Invalid email format
        "password": "securepass",
        "occupation": "Designer",
        "gender": "female"
    }
    response = client.post("/api/users/register", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 500  # Your API does not validate emails, so it may throw an error
    assert "error" in response.json


@pytest.mark.skip(reason="API does not currently support password confirmation")
def test_register_mismatched_passwords(client):
    """Test user registration fails when passwords do not match."""
    payload = {
        "name": "Charlie",
        "surname": "Brown",
        "username": "charlie123",
        "email": "charlie@example.com",
        "password": "password1",  # Password mismatch scenario
        "confirm_password": "password2",  # Your API does not handle this yet
        "occupation": "Student",
        "gender": "male"
    }
    response = client.post("/api/users/register", data=json.dumps(payload), content_type="application/json")
    
    # Your API does not currently check for password confirmation, so this test is skipped
    assert response.status_code == 400
    assert "Passwords do not match" in response.json["error"]
