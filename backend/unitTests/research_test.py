import pytest
from flask import json
from app import app, db
from models import Research, User
from flask_bcrypt import Bcrypt
from datetime import datetime

bcrypt = Bcrypt()
testResearch1 = ""

@pytest.fixture
def client():
    """Creates a test client for the Flask app."""
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # In-memory database for tests
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


#Creates a test user in the database
@pytest.fixture
def create_test_user(client):
    hashed_password = bcrypt.generate_password_hash("testpassword").decode("utf-8")
    user = User(
        name="Test",
        surname="User",
        username="testuser",
        email="test@example.com",
        password=hashed_password,
        bio="hello, this is bio text sample for test",
        is_admin=False,
        occupation="Tester",
        gender="male",
        image_url="https://example.com/avatar.png"
    )
    db.session.add(user)
    db.session.commit()
    return user


# Test creating multiple researches and returning the research IDs
@pytest.fixture
def test_create_multiple_researches(client, create_test_user):
    with app.app_context():
        user = User.query.filter_by(email="test@example.com").first()  # Re-fetch user
    
    with client.session_transaction() as sess:
        sess["user_id"] = user.id  # Simulate logged-in user

    payload1 = {
        "title": "AI in Healthcare",
        "description": "Exploring the impact of AI in healthcare.",
        "tags": "#AI, #healthcare, #technology"
    }

    payload2 = {
        "title": "Blockchain in Finance",
        "description": "Understanding the impact of blockchain in financial systems.",
        "tags": "#blockchain, #finance, #technology"
    }

    response1 = client.post("/api/researches/create", json=payload1)
    data1 = response1.get_json()

    response2 = client.post("/api/researches/create", json=payload2)
    data2 = response2.get_json()

    assert response1.status_code == 200
    assert "id" in data1
    assert data1["msg"] == "Research created successfully"

    assert response2.status_code == 200
    assert "id" in data2
    assert data2["msg"] == "Research created successfully"

    with app.app_context():
        research1 = db.session.get(Research, data1["id"])
        assert research1 is not None
        assert research1.title == payload1["title"]
        assert research1.description == payload1["description"]
        assert research1.tags == payload1["tags"]
        assert research1.author_id == user.id
        assert research1.author_name == user.username

        research2 = db.session.get(Research, data2["id"])
        assert research2 is not None
        assert research2.title == payload2["title"]
        assert research2.description == payload2["description"]
        assert research2.tags == payload2["tags"]
        assert research2.author_id == user.id
        assert research2.author_name == user.username

    return data1["id"], data2["id"]


#Test successfully deleting an existing research entry.
def test_delete_research_success(client, test_create_multiple_researches):
    research1_id, _ = test_create_multiple_researches
    response = client.delete(f"/api/researches/{research1_id}")
    assert response.status_code == 200
    assert "Research deleted successfully" in response.json["msg"]
    with app.app_context():
        research_deleted = db.session.get(Research, research1_id)
        assert research_deleted is None


# Test creating research with an unauthorized user (no session set)
def test_create_research_unauthorized(client):
    """Test creating a research entry with an unauthorized user."""
    # Define the research data payload
    payload = {
        "title": "AI Research",
        "description": "Exploring the impact of AI in healthcare.",
        "tags": "#AI, #healthcare, #technology"
    }

    # Send POST request to create research without setting user_id in session
    response = client.post("/api/researches/create", json=payload)
    data = response.get_json()

    # Assertions
    assert response.status_code == 401
    assert data["error"] == "No logged in user found. Unauthorized..."


#Test deleting a non-existing research entry.
def test_delete_research_not_found(client):
    response = client.delete("/api/researches/999")  # Non-existent ID
    assert response.status_code == 400
    assert "Research not found" in response.json["error"]


#Test updating an existing research entry
def test_update_research(client, create_test_user):
    
    with app.app_context():
        user = User.query.filter_by(email="test@example.com").first()  # Re-fetch user
    
    with client.session_transaction() as sess:
        sess["user_id"] = user.id

    payload = {
        "title": "AI in Healthcare",
        "description": "Exploring the impact of AI in healthcare.",
        "tags": "#AI, #healthcare, #technology"
    }

    response1 = client.post("/api/researches/create", json=payload)
    data1 = response1.get_json()
    research_id = data1["id"]

    updated_payload = {
        "title": "AI in Healthcare - Updated",
        "description": "Exploring the broader impact of AI in healthcare, including challenges.",
        "tags": "#AI, #healthcare, #future"
    }

    response2 = client.put(f"/api/researches/{research_id}", json=updated_payload)
    data2 = response2.get_json()

    assert response2.status_code == 200
    assert data2["msg"] == "Research updated successfully"

    with app.app_context():
        updated_research = db.session.get(Research, research_id)
        assert updated_research is not None
        assert updated_research.title == updated_payload["title"]
        assert updated_research.description == updated_payload["description"]
        assert updated_research.tags == updated_payload["tags"]


#Test retrieving research entries for a specific user
def test_get_current_user_research(client, create_test_user):
    with app.app_context():
        user = User.query.filter_by(email="test@example.com").first()
    
    with client.session_transaction() as sess:
        sess["user_id"] = user.id

    payload1 = {
        "title": "AI in Healthcare",
        "description": "Exploring the impact of AI in healthcare.",
        "tags": "#AI, #healthcare, #technology"
    }

    response1 = client.post("/api/researches/create", json=payload1)
    data1 = response1.get_json()
    research_id1 = data1["id"] 

    response = client.get(f"/api/researches/user/{user.id}")
    research_data = response.get_json()

    assert response.status_code == 200

    assert research_data[0]["title"] == payload1["title"]
    assert research_data[0]["description"] == payload1["description"]
    assert research_data[0]["tags"] == payload1["tags"]


