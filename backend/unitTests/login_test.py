import pytest
from app import app, db
from models import User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

@pytest.fixture
def client():
    """Setup a Flask test client and an in-memory database."""
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SESSION_TYPE"] = "filesystem"  # Change session type for tests
    with app.app_context():
        db.create_all()
    

    with app.test_client() as client:
        yield client  # Provide the test client

    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture
def create_test_user():
    """Creates a test user for login tests."""
    with app.app_context():  # Ensure we are in an app context
        password_hash = bcrypt.generate_password_hash("testpassword").decode("utf-8")
        user = User(
            name="Test",
            surname="User",
            username="testuser",
            email="test@example.com",
            password=password_hash,
            occupation="Tester",
            gender="male",
            image_url="https://example.com/avatar.png"
        )
        db.session.add(user)
        db.session.commit()
        yield user  # Use `yield` so pytest can properly handle fixture teardown

        # Cleanup: Remove the user after the test
        db.session.delete(user)
        db.session.commit()


def test_successful_login(client, create_test_user):
    """Test login with correct credentials."""
    response = client.post("/api/users/login", json={
        "username": "testuser",
        "password": "testpassword"
    })

    assert response.status_code == 201
    data = response.get_json()
    assert data["msg"] == "Login successfull."
    assert "id" in data
    assert data["username"] == "testuser"


def test_login_wrong_password(client, create_test_user):
    """Test login with incorrect password."""
    response = client.post("/api/users/login", json={
        "username": "testuser",
        "password": "wrongpassword"
    })

    assert response.status_code == 401
    assert response.get_json()["error"] == "Unauthorized, Password is incorrect!"


def test_login_wrong_username(client):
    """Test login with incorrect username."""
    response = client.post("/api/users/login", json={
        "username": "nonexistent",
        "password": "testpassword"
    })

    assert response.status_code == 401
    assert response.get_json()["error"] == "Unauthorized, username is incorrect!"
