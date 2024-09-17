import random
from django.conf import settings

def get_random_word():
    with open(settings.WORD_LIST_PATH, 'r') as f:
        words = f.read().splitlines()
    return random.choice(words).upper()

def check_guess(secret_word, guess):
    result = [''] * 5
    secret_word_chars = list(secret_word)
    
    # First pass: check for correct letters in correct positions
    for i in range(5):
        if guess[i] == secret_word[i]:
            result[i] = 'correct'
            secret_word_chars[i] = None
    
    # Second pass: check for correct letters in wrong positions
    for i in range(5):
        if result[i] == '':
            if guess[i] in secret_word_chars:
                result[i] = 'present'
                secret_word_chars[secret_word_chars.index(guess[i])] = None
            else:
                result[i] = 'absent'
    
    return result