"""
# Delete User

 -- Deleting a non-existing user should return an error.

 -- Deleting an existing user should be successful.

# Update User

 -- Updating a non-existing user should return an error.

 -- Updating a user with a new username that is already taken should return an error.

 -- Successfully updating a user with valid data.

# Update User Password

 -- Updating a non-existing user’s password should return an error.

 -- Entering an incorrect old password should return an error.

"""

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

    # Ensure users are added to the session and committed
    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()  # This ensures the users are saved and have IDs
    
    return user1, user2


def test_delete_user_not_found(client):
    """Test deleting a non-existing user."""
    response = client.delete("/api/users/999")  # Non-existent ID
    assert response.status_code == 400
    assert "User not found" in response.json["error"]



def test_delete_user_success(client, create_test_users):
    """Test successfully deleting an existing user."""
    user1, _ = create_test_users
    response = client.delete(f"/api/users/{user1.id}")
    assert response.status_code == 200
    assert "User deleted successfully" in response.json["msg"]



def test_update_user_not_found(client):
    """Test updating a non-existing user."""
    payload = {"name": "Updated Name"}
    response = client.put("/api/users/999", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 404
    assert "User not found" in response.json["error"]



def test_update_user_username_taken(client, create_test_users):
    """Test updating a user with a username that already exists."""
    user1, user2 = create_test_users
    payload = {"username": user2.username}  # Username already exists
    response = client.put(f"/api/users/{user1.id}", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 400
    assert "Username already taken" in response.json["error"]



def test_update_user_success(client, create_test_users):
    """Test successfully updating a user."""
    user1, _ = create_test_users
    payload = {"name": "Updated Name", "email": "updated@example.com"}
    response = client.put(f"/api/users/{user1.id}", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    assert "User updated successfully" in response.json["msg"]



def test_update_password_user_not_found(client):
    """Test updating the password of a non-existing user."""
    payload = {"oldPassword": "oldpassword", "newPassword": "newpassword"}
    response = client.put("/api/users/updatePass/999", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 404
    assert "User not found" in response.json["error"]



def test_update_password_incorrect_old_password(client, create_test_users):
    """Test updating the password with an incorrect old password."""
    user1, _ = create_test_users
    payload = {"oldPassword": "wrongpassword", "newPassword": "newpassword"}
    response = client.put(f"/api/users/updatePass/{user1.id}", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 401
    assert "Unauthorized, Password is incorrect!" in response.json["error"]



def test_update_password_success(client, create_test_users):
    """Test successfully updating the password with the correct old password."""
    user1, _ = create_test_users
    payload = {"oldPassword": "oldpassword", "newPassword": "newpassword"}
    response = client.put(f"/api/users/updatePass/{user1.id}", data=json.dumps(payload), content_type="application/json")
    assert response.status_code == 200
    assert "User password changed successfully" in response.json["msg"]
