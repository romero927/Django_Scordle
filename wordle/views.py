from django.shortcuts import render
from django.http import JsonResponse
from .utils import get_random_word, check_guess, is_valid_word
from django.utils import timezone

def game(request):
    return render(request, 'wordle/game.html')

def make_guess(request):
    if request.method == 'POST':
        guess = request.POST.get('guess', '').upper()
        secret_word = request.session.get('secret_word')
        score = request.session.get('score', 0)
        start_time = request.session.get('start_time')
        
        if not secret_word or not start_time:
            return JsonResponse({'error': 'No active game. Please start a new game.'})
        
        if len(guess) != 5:
            return JsonResponse({'error': 'Guess must be 5 letters long'})
        
        if not is_valid_word(guess):
            return JsonResponse({'error': 'Not in word list', 'valid_word': False})

        result = check_guess(secret_word, guess)
        game_over = (guess == secret_word) or (len(request.session.get('guesses', [])) == 5)

        # Calculate time bonus
        elapsed_time = (timezone.now() - timezone.datetime.fromisoformat(start_time)).total_seconds()
        time_bonus = max(300 - int(elapsed_time), 0)  # Max 300 points for solving within 5 minutes

        for i in range(5):
            if result[i] == 'correct':
                score += (6 - len(request.session.get('guesses', []))) * 10
            elif result[i] == 'present':
                score += 5

        if game_over and guess == secret_word:
            score += time_bonus

        request.session['score'] = score
        request.session['guesses'] = request.session.get('guesses', []) + [{'word': guess, 'result': result}]
        request.session.modified = True
        
        return JsonResponse({
            'result': result,
            'game_over': game_over,
            'secret_word': secret_word,
            'valid_word': True,
            'score': score,
            'time_bonus': time_bonus if game_over and guess == secret_word else 0
        })

def new_game(request):
    if request.method == 'POST':
        secret_word = get_random_word()
        request.session['secret_word'] = secret_word
        request.session['guesses'] = []
        request.session['score'] = 0
        request.session['start_time'] = timezone.now().isoformat()
        return JsonResponse({'success': True, 'secret_word': secret_word})