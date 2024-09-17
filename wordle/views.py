from django.shortcuts import render
from django.http import JsonResponse
from .utils import get_random_word, check_guess

def game(request):
    if 'secret_word' not in request.session:
        request.session['secret_word'] = get_random_word()
        request.session['guesses'] = []
        request.session['game_over'] = False

    return render(request, 'wordle/game.html')

def make_guess(request):
    if request.method == 'POST':
        guess = request.POST.get('guess', '').upper()
        secret_word = request.session['secret_word']
        
        if len(guess) != 5:
            return JsonResponse({'error': 'Guess must be 5 letters long'})
        
        result = check_guess(secret_word, guess)
        request.session['guesses'].append({'word': guess, 'result': result})
        request.session.modified = True
        
        game_over = (guess == secret_word) or (len(request.session['guesses']) == 6)
        if game_over:
            request.session['game_over'] = True
        
        return JsonResponse({
            'result': result,
            'game_over': game_over,
            'secret_word': secret_word if game_over else None
        })

def new_game(request):
    if request.method == 'POST':
        request.session['secret_word'] = get_random_word()
        request.session['guesses'] = []
        request.session['game_over'] = False
        return JsonResponse({'success': True})