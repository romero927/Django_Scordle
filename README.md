# Scordle

Scordle is an engaging word-guessing game built with Django, featuring a timer and score system. It's inspired by the popular game Wordle but with added gameplay elements for a more exciting experience.

Live Demo: [https://kgromero-Scordle.fly.dev/](https://kgromero-Scordle.fly.dev/)

## Features

- Random word selection from a curated list
- Six attempts to guess the correct word
- Visual feedback on letter correctness
- Dynamic keyboard updates reflecting guessed letters
- New game functionality without page refresh
- Responsive design for various screen sizes
- Scoring system based on accuracy and speed
- Timer to add excitement and challenge

## Technologies Used

- Python 3.9+
- Django 3.2+
- JavaScript (ES6+)
- HTML5 & CSS3
- Docker (optional)

## Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/romero927/Django_Scordle.git
   cd Django_Scordle
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install required packages:
   ```
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```
   python manage.py migrate
   ```

5. Run the development server:
   ```
   python manage.py runserver
   ```

6. Open your browser and navigate to `http://localhost:8000` to play the game.

## Docker Setup

1. Build the Docker image:
   ```
   docker build -t scordle .
   ```

2. Run the Docker container:
   ```
   docker run -p 8000:8000 scordle
   ```

3. Access the game at `http://localhost:8000` in your browser.

## Deployment

This project is configured for deployment on Fly.io. To deploy your own instance:

1. Install the Fly.io CLI and authenticate.
2. Initialize your Fly.io app:
   ```
   fly launch
   ```
3. Deploy the application:
   ```
   fly deploy
   ```

## Game Rules

- You have six attempts to guess a five-letter word.
- After each guess, you'll receive feedback:
  - Green: Correct letter in the correct position
  - Yellow: Correct letter in the wrong position
  - Gray: Letter not in the word
- Score is calculated based on:
  - Correct letter placements
  - Speed of solving
  - Number of attempts used

## Customization

- Modify the word list in `scordle/answer_word_list.txt`
- Adjust game logic in `scordle/utils.py` and `scordle/views.py`
- Customize the UI by editing `static/css/styles.css` and templates in `templates/scordle/`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Inspired by the original Wordle game
- Built with Django web framework
- Deployed using Fly.io