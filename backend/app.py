from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:1234@localhost/courseproject'

db = SQLAlchemy(app)

import routes

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

"""
con = get_db_connection()


@app.route('/getTable', methods=['GET'])
def get_tables():
    cursor=con.cursor()
    cursor.execute("SHOW TABLES;")
    tables=cursor.fetchall()
    cursor.close()
    con.close()
    table_names=[table[0] for table in tables]
    return jsonify({"tables": table_names}),200



if __name__=="__main__":
    print("connecting to db...")
    app.run(debug=True)"
    """