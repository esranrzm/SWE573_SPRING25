import pytest
from flask import json
from app import app, db
from models import User, Comment
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

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

# Fixture to create a test research
@pytest.fixture
def create_test_research(client, create_test_user):
    with app.app_context():
        user = User.query.filter_by(email="test@example.com").first()

    with client.session_transaction() as sess:
        sess["user_id"] = user.id

    payload = {
        "title": "AI in Healthcare",
        "description": "Exploring the impact of AI in healthcare.",
        "tags": "#AI, #healthcare, #technology"
    }

    response = client.post("/api/researches/create", json=payload)
    data = response.get_json()

    return data["id"]


# Test creating a comment successfully
def test_create_comment(client, create_test_user, create_test_research):
    with app.app_context():
        user = User.query.filter_by(email="test@example.com").first()
        research_id = create_test_research

    with client.session_transaction() as sess:
        sess["user_id"] = user.id 

    comment_payload = {
        "researchId": research_id,
        "comment": "This is a test comment"
    }

    response = client.post("/api/comments/create", json=comment_payload)
    data = response.get_json()

    assert response.status_code == 200
    assert "id" in data
    assert data["msg"] == "Comment added successfully"

    # Verify the comment was added to the database
    new_comment = Comment.query.filter_by(id=data["id"]).first()
    assert new_comment is not None
    assert new_comment.author_id == user.id
    assert new_comment.research_id == research_id
    assert new_comment.comment == comment_payload["comment"]
    assert new_comment.author_name == user.username
    assert new_comment.created_at is not None


# Test deleting a comment successfully
def test_delete_comment(client, create_test_comment):
    comment_id = create_test_comment

    response = client.delete(f"/api/comments/{comment_id}")
    data = response.get_json()

    assert response.status_code == 200
    assert data["msg"] == "Comment deleted successfully"

    deleted_comment = Comment.query.get(comment_id)
    assert deleted_comment is None


# Test updating an existing comment successfully
def test_update_comment(client, create_test_comment):
    comment_id = create_test_comment

    updated_comment_data = {
        "comment": "This is the updated test comment"
    }

    response = client.put(f"/api/comments/{comment_id}", json=updated_comment_data)
    data = response.get_json()

    assert response.status_code == 200
    assert data["msg"] == "Comment updated successfully"

    updated_comment = Comment.query.get(comment_id)
    assert updated_comment.comment == "This is the updated test comment"


# Test fetching comments of a user successfully
def test_get_current_user_comments(client, create_test_comment):
    user_id = "1"
    comment_data = create_test_comment(user_id)
    
    response = client.get(f"/api/comments/user/{user_id}")
    data = response.get_json()

    assert response.status_code == 200
    assert isinstance(data, list)
    assert len(data) > 0 

    for research in data:
        assert "id" in research
        assert "title" in research


# Test fetching comments when no comments exist for the user
def test_get_current_user_comments_no_comments(client):
    user_id = "999" 
    
    response = client.get(f"/api/comments/user/{user_id}")
    data = response.get_json()

    assert response.status_code == 404
    assert data["error"] == "No comments found for this author"


# Test fetching comments for a specific research successfully
def test_get_current_research_comments(client, create_test_comment, create_research):
    research_id = "1"
    create_research(research_id)
    create_test_comment(research_id) 

    response = client.get(f"/api/comments/research/{research_id}")
    data = response.get_json()

    assert response.status_code == 200
    assert isinstance(data, list)
    assert len(data) > 0 

    for comment in data:
        assert "id" in comment
        assert "author_id" in comment
        assert "author_name" in comment
        assert "comment" in comment
        assert "created_at" in comment


# Test fetching comments when no comments exist for the research
def test_get_current_research_comments_no_comments(client):
    research_id = "999"  # Non-existent research ID
    
    response = client.get(f"/api/comments/research/{research_id}")
    data = response.get_json()

    assert response.status_code == 404
    assert data["error"] == "No comments found for this research"