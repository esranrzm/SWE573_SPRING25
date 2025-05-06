from app import db
from uuid import uuid4

def get_uuid():
    return uuid4().hex


class User(db.Model):
    __tablename__ = "Users"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    password = db.Column(db.Text, nullable=False)
    bio = db.Column(db.String(200), nullable=True)
    is_admin = db.Column(db.Boolean, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    occupation = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(200), nullable=True)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "surname": self.surname,
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "bio": self.bio,
            "isAdmin": self.is_admin,
            "gender": self.gender,
            "occupation": self.occupation,
            "imgUrl": self.image_url
        }
    
class CurrentUser(db.Model):
    __tablename__ = "Currentuser"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    user_id = db.Column(db.String(32), nullable=False)
    logged_at = db.Column(db.String(30), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "loggedAt": self.created_at
        }

class Research(db.Model):
    __tableName__ = "Researches"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    author_id = db.Column(db.String(32), nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(1000), nullable=False)
    tags = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.String(30), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "authorId": self.author_id,
            "authorName": self.author_name,
            "title": self.title,
            "description": self.description,
            "tags": self.tags,
            "createdAt": self.created_at
        }
    
class Comment(db.Model):
    __tableName__ = "Comments"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    author_id = db.Column(db.String(32), nullable=False)
    author_name = db.Column(db.String(100), nullable=False)
    research_id = db.Column(db.String(32), nullable=False)
    comment = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(db.String(30), nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "authorId": self.author_id,
            "authorName": self.author_name,
            "researchId": self.research_id,
            "comment": self.comment,
            "createdAt": self.created_at
        }

    
