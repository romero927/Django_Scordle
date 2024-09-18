from django.shortcuts import render
from django.http import JsonResponse
from .utils import get_random_word, check_guess, is_valid_word

def game(request):
    return render(request, 'wordle/game.html')

def make_guess(request):
    if request.method == 'POST':
        guess = request.POST.get('guess', '').upper()
        secret_word = request.session.get('secret_word')
        score = request.session.get('score', 0)  # Initialize score if not present
        
        if not secret_word:
            return JsonResponse({'error': 'No active game. Please start a new game.'})
        
        if len(guess) != 5:
            return JsonResponse({'error': 'Guess must be 5 letters long'})
        
        if not is_valid_word(guess):
            return JsonResponse({'error': 'Not in word list', 'valid_word': False})

        result = check_guess(secret_word, guess)
        game_over = (guess == secret_word) or (len(request.session.get('guesses', [])) == 5)

        # Update score based on correct guesses
        for i in range(5):
            if result[i] == 'correct':
                score += (6 - len(request.session.get('guesses', []))) * 10  # More points for earlier guesses
            elif result[i] == 'present':
                score += 5  # Partial points for present letters

        # Store score in the session
        request.session['score'] = score
        request.session['guesses'] = request.session.get('guesses', []) + [{'word': guess, 'result': result}]
        request.session.modified = True
        
        return JsonResponse({
            'result': result,
            'game_over': game_over,
            'secret_word': secret_word if game_over else None,
            'valid_word': True,
            'score': score  # Return the updated score
        })

def new_game(request):
    if request.method == 'POST':
        request.session['secret_word'] = get_random_word()
        request.session['guesses'] = []
        request.session['score'] = 0  # Reset the score for the new game
        return JsonResponse({'success': True})
