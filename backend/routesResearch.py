from app import app, db
from flask import request, jsonify, session
from models import Research, User, Comment, Node
from flask_bcrypt import Bcrypt
from flask_session import Session
from datetime import datetime
import requests

bcrypt = Bcrypt(app)
server_session = Session(app)

# Get all research
@app.route("/api/researches", methods=["GET"])
def get_researches():
    researches = Research.query.order_by(Research.created_at.desc()).all()
    result = [research.to_json() for research in researches]
    return jsonify(result)

# get current research
@app.route("/api/researches/<string:id>", methods=["GET"])
def get_current_research(id):
    
    research = Research.query.filter_by(id=id).first()

    research_comments = Comment.query.filter_by(research_id=id).all()
    research_nodes = Node.query.filter_by(research_id=id).all()

    research_comment_users = set()
    research_node_users = set()
    if research_comments:
        research_comment_users = {user.author_id for user in research_comments}
    if research_nodes:
        research_node_users = {user.user_id for user in research_nodes}
    
    unique_users = []
    for comment_user in research_comment_users:
        if comment_user not in unique_users:
            unique_users.append(comment_user)

    for node_user in research_node_users:
        if node_user not in unique_users:
            unique_users.append(node_user)

    print(len(unique_users))

    return jsonify({
        "id": research.id,
        "authorId": research.author_id,
        "authorName": research.author_name,
        "title": research.title,
        "description": research.description,
        "tags": research.tags,
        "createdAt": research.created_at,
        "researchCollaboratorCount": len(unique_users)
    }), 200


# get current research
@app.route("/api/researches/user/<string:id>", methods=["GET"])
def get_current_user_research(id):
    
    user_researches = Research.query.filter_by(author_id=id).order_by(Research.created_at.desc()).all()

    if not user_researches:
        return jsonify({"error": "No research found for this author"}), 404

    result = [research.to_json() for research in user_researches]
    return jsonify(result)


# create a research
@app.route("/api/researches/create", methods=["POST"])
def create_research():
    try:
        data=request.json
        title = data.get("title")
        description = data.get("description")
        userId = data.get("userId")
        tags = data.get("tags")

        author = User.query.filter_by(id=userId).first()
        if author:
            username=author.username
        else:
            return jsonify({"error": "No user found. Check the DB."}), 404

        authorName = username
        createdAt = datetime.now().strftime("%Y-%m-%d %H:%M:%S")


        new_research = Research(
                            author_id=userId,
                            author_name=authorName,
                            title=title,
                            description=description,
                            tags=tags,
                            created_at=createdAt
                        )

        db.session.add(new_research)
        db.session.commit()

        return jsonify(
            {
                "id": new_research.id,
                "msg": "Research created successfully"
            }
        ),200
     
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# delete research
@app.route("/api/researches/<string:id>", methods=["DELETE"])
def delete_research(id):
    try:
        research = Research.query.get(id)
        if research is None:
            return jsonify({"error": "Research not found"}), 400
        
        research_comments = Comment.query.filter_by(research_id=id).order_by(Comment.created_at.desc()).all()

        if research_comments:
            try:
                ##response = requests.delete(f"http://44.211.252.187:5000/api/comments/research/{id}")
                research_comments_resp = Comment.query.filter_by(research_id=id).order_by(Comment.created_at.desc()).all()
                if not research_comments_resp:
                    return jsonify({"error": "No comments found with that research_id"}), 400

                for comment in research_comments_resp:
                    db.session.delete(comment)
            except requests.exceptions.RequestException as e:
                app.logger.error(f"Failed to delete comments for research {id}: {e}")
        
        db.session.delete(research)
        db.session.commit()

        return jsonify({"msg":"Research deleted successfully"}),200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# update research
@app.route("/api/researches/<string:id>", methods=["PUT"])
def update_research(id):
    try:
        research = Research.query.get(id)
        if research is None:
            return jsonify({"error": "Research not found"}), 404
        
        data = request.json
        research.title = data.get("title", research.title)
        research.description = data.get("description", research.description)
        research.tags =  data.get("tags", research.tags)

        
        db.session.commit()
        return jsonify({"msg":"Research updated successfully"}),200
        
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500