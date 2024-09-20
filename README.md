# Wurdle

This project is a Django-based clone of the popular word-guessing game Wordle.

Available to test at: [https://kgromero-hurdle.fly.dev/](https://kgromero-hurdle.fly.dev/)

## Features

- Random word selection from a predefined list
- Six attempts to guess the word
- Visual feedback on letter correctness
- Keyboard updates to reflect guessed letters
- New game functionality without page refresh
- Responsive design for various screen sizes

## Prerequisites

- Python 3.9+
- Django 3.2+
- Docker (optional)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/wordle-clone.git
   cd wordle-clone
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser (optional):
   ```
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```
   python manage.py runserver
   ```

7. Open your browser and navigate to `http://localhost:8000` to play the game.

## Docker Setup

1. Build the Docker image:
   ```
   docker build -t wordle-clone .
   ```

2. Run the Docker container:
   ```
   docker run -p 8000:8000 wordle-clone
   ```

3. Open your browser and navigate to `http://localhost:8000` to play the game.

## Customization

- To modify the word list, edit the `WORD_LIST_PATH` in `settings.py` to point to your custom word list file.
- Adjust the game logic in `utils.py` and `views.py` to change game rules or behavior.
- Modify the frontend appearance by editing `static/css/styles.css` and the templates in the `templates/wordle/` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
