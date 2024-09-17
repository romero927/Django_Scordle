from django.shortcuts import render
from django.http import JsonResponse
from .utils import get_random_word, check_guess, is_valid_word

def game(request):
    return render(request, 'wordle/game.html')

def make_guess(request):
    if request.method == 'POST':
        guess = request.POST.get('guess', '').upper()
        secret_word = request.session.get('secret_word')
        
        if not secret_word:
            return JsonResponse({'error': 'No active game. Please start a new game.'})
        
        if len(guess) != 5:
            return JsonResponse({'error': 'Guess must be 5 letters long'})
        
        if not is_valid_word(guess):
            return JsonResponse({'error': 'Not in word list', 'valid_word': False})
        
        result = check_guess(secret_word, guess)
        game_over = (guess == secret_word) or (len(request.session.get('guesses', [])) == 5)
        
        request.session['guesses'] = request.session.get('guesses', []) + [{'word': guess, 'result': result}]
        request.session.modified = True
        
        return JsonResponse({
            'result': result,
            'game_over': game_over,
            'secret_word': secret_word if game_over else None,
            'valid_word': True
        })

def new_game(request):
    if request.method == 'POST':
        request.session['secret_word'] = get_random_word()
        request.session['guesses'] = []
        return JsonResponse({'success': True})