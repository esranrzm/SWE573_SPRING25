from app import app, db
from flask import request, jsonify, session
from models import Research, User, Comment, CurrentUser
from flask_bcrypt import Bcrypt
from flask_session import Session
from datetime import datetime
import requests

bcrypt = Bcrypt(app)
server_session = Session(app)

# Get all comments
@app.route("/api/comments", methods=["GET"])
def get_comments():
    comments = Comment.query.order_by(Comment.created_at.desc()).all()
    result = [comment.to_json() for comment in comments]
    return jsonify(result)


# get current comment
@app.route("/api/comments/<string:id>", methods=["GET"])
def get_current_comment(id):
    
    comment = Comment.query.filter_by(id=id).first()

    return jsonify({
        "id": comment.id,
        "authorId": comment.author_id,
        "authorName": comment.author_name,
        "researchId": comment.research_id,
        "comment": comment.comment,
        "createdAt": comment.created_at
    }), 200


# get current research's comments
@app.route("/api/comments/research/<string:id>", methods=["GET"])
def get_current_research_comments(id):
    try:
        research_comments = Comment.query.filter_by(research_id=id).order_by(Comment.created_at.desc()).all()

        if not research_comments:
            return jsonify({"error": "No comments found for this research"}), 404

        comments_list = []
        for comment in research_comments:
            current_comment = {
                "id": comment.id,
                "author_id": comment.author_id,
                "author_name": comment.author_name,
                "research_id": comment.research_id,
                "comment": comment.comment,
                "created_at": comment.created_at
            }
            comments_list.append(current_comment)
        
        return jsonify(comments_list), 200

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500


# get current user's comments
@app.route("/api/comments/user/<string:id>", methods=["GET"])
def get_current_user_comments(id):
    try:
        user_commented_researches = Comment.query.filter_by(author_id=id).order_by(Comment.created_at.desc()).all()

        if not user_commented_researches:
            return jsonify({"error": "No comments found for this author"}), 404

        research_ids = [comment.research_id for comment in user_commented_researches]
        comment_ids = [comment.id for comment in user_commented_researches]
        research_details = []

        for index, research_id in enumerate(research_ids):
            try:
                ##response = requests.get(f"http://44.211.252.187:5000/api/researches/{research_id}")
                research_resp = Research.query.filter_by(id=research_id).first()
                if not research_resp:
                    continue  # skip if research not found
                research = {
                    "id": research_resp.id,
                    "commentId": comment_ids[index],
                    "authorId": research_resp.author_id,
                    "authorName": research_resp.author_name,
                    "title": research_resp.title,
                    "description": research_resp.description,
                    "tags": research_resp.tags,
                    "createdAt": research_resp.created_at
                }

                research_details.append(research)
            except requests.exceptions.RequestException as e:
                app.logger.error(f"Failed to fetch research {research_id}: {e}")
                continue

        return jsonify(research_details)

    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500


# create a research
@app.route("/api/comments/create", methods=["POST"])
def create_comment():
    try:
        author= CurrentUser.query.first() #session.get("user_id")
        if author:
            user = User.query.filter_by(id=author.user_id).first()
            if user:
                username=user.username
            else:
                return jsonify({"error": "No user found. Check the DB."}), 404
        else:
            return jsonify({"error": "No logged in user found. Unauthorized..."}), 401

        data=request.json
        authorName = username
        researchId = data.get("researchId")
        comment = data.get("comment")
        createdAt = datetime.now().strftime("%Y-%m-%d %H:%M:%S")


        new_comment = Comment(
            #session.get("user_id"),
                            author_id=author.user_id, 
                            author_name=authorName,
                            research_id=researchId,
                            comment=comment,
                            created_at=createdAt
                        )

        db.session.add(new_comment)
        db.session.commit()

        return jsonify(
            {
                "id": new_comment.id,
                "msg": "Comment added successfully"
            }
        ),200
     
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

# delete research
@app.route("/api/comments/<string:id>", methods=["DELETE"])
def delete_comment(id):
    try:
        comment = Comment.query.get(id)
        if comment is None:
            return jsonify({"error": "Comment not found"}), 400
        
        db.session.delete(comment)
        db.session.commit()
        return jsonify({"msg":"Comment deleted successfully"}),200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/comments/research/<string:research_id>", methods=["DELETE"])
def delete_comments_by_research_id(research_id):
    try:
        comments = Comment.query.filter_by(research_id=research_id).all()
        if not comments:
            return jsonify({"error": "No comments found with that research_id"}), 400

        for comment in comments:
            db.session.delete(comment)
        db.session.commit()

        return jsonify({"msg": f"{len(comments)} comment(s) deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# update comment
@app.route("/api/comments/<string:id>", methods=["PUT"])
def update_comment(id):
    try:
        comment = Comment.query.get(id)
        if comment is None:
            return jsonify({"error": "Comment not found"}), 404
        
        data = request.json
        comment.comment = data.get("comment", comment.comment)

        db.session.commit()
        return jsonify({"msg":"Comment updated successfully"}),200
        
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500