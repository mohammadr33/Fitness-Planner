from flask import Flask, render_template, request, jsonify, send_file
import sqlite3
import csv
import os

app = Flask(__name__)

# Initialize SQLite Database
def init_db():
    try:
        print("Initializing the database...")
        conn = sqlite3.connect('workouts.db')
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS workouts (
                        id INTEGER PRIMARY KEY,
                        name TEXT,
                        category TEXT,
                        reps INTEGER,
                        sets INTEGER)''')
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error initializing database: {str(e)}")

# Optional: Function to reset the database (only for debugging)
def reset_db():
    try:
        conn = sqlite3.connect('workouts.db')
        c = conn.cursor()
        c.execute("DROP TABLE IF EXISTS workouts")  # Drop the table if it exists
        conn.commit()
        conn.close()
        init_db()  # Reinitialize the table after dropping it
        print("Database reset successfully.")
    except Exception as e:
        print(f"Error resetting database: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add-workout', methods=['POST'])
def add_workout():
    try:
        name = request.form.get('name')
        reps = int(request.form.get('reps'))  # Convert reps to integer
        sets = int(request.form.get('sets'))  # Convert sets to integer
        category = request.form.get('category')

        # Debugging: print received data
        print(f"Received workout: name={name}, reps={reps}, sets={sets}, category={category}")

        if not name or not category or not reps or not sets:
            return jsonify({'message': 'Error: Missing workout data'}), 400

        conn = sqlite3.connect('workouts.db')
        c = conn.cursor()
        c.execute("INSERT INTO workouts (name, category, reps, sets) VALUES (?, ?, ?, ?)",
                  (name, category, reps, sets))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Workout added successfully!'}), 201
    except Exception as e:
        print(f"Error occurred while adding workout: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/get-workouts', methods=['GET'])
def get_workouts():
    try:
        conn = sqlite3.connect('workouts.db')
        c = conn.cursor()
        c.execute("SELECT * FROM workouts")
        workouts = c.fetchall()
        conn.close()
        return jsonify(workouts)
    except Exception as e:
        print(f"Error occurred while fetching workouts: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/export-workouts', methods=['GET'])
def export_workouts():
    try:
        conn = sqlite3.connect('workouts.db')
        c = conn.cursor()
        c.execute("SELECT * FROM workouts")
        workouts = c.fetchall()
        conn.close()

        with open('workouts.csv', 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['ID', 'Name', 'Category', 'Reps', 'Sets'])
            writer.writerows(workouts)

        return send_file('workouts.csv', as_attachment=True)
    except Exception as e:
        print(f"Error occurred while exporting workouts: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/clear-workouts', methods=['POST'])
def clear_workouts():
    try:
        conn = sqlite3.connect('workouts.db')
        c = conn.cursor()
        c.execute("DELETE FROM workouts")
        conn.commit()
        conn.close()
        return jsonify({'message': 'Workouts cleared successfully!'})
    except Exception as e:
        print(f"Error occurred while clearing workouts: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/delete-workout/<int:id>', methods=['DELETE'])
def delete_workout(id):
    try:
        conn = sqlite3.connect('workouts.db')
        c = conn.cursor()
        c.execute("DELETE FROM workouts WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Workout deleted successfully!'})
    except Exception as e:
        print(f"Error occurred while deleting workout: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    # Uncomment this line to reset the DB when needed (e.g., during debugging)
    # reset_db()  # Reset the DB (only for debugging purposes)

    init_db()  # Ensure the DB is initialized
    app.run(debug=True)
