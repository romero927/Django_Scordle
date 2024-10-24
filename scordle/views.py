from django.shortcuts import render
from django.http import JsonResponse
from .utils import get_random_word, check_guess, is_valid_word
from django.utils import timezone

def make_guess(request):
    if request.method == 'POST':
        guess = request.POST.get('guess', '').upper()
        secret_word = request.session.get('secret_word')
        score = request.session.get('score', 0)
        start_time = request.session.get('start_time')
        found_letters = request.session.get('found_letters', {'correct': [], 'present': []})

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

        # Calculate score based on current guess
        guess_number = len(request.session.get('guesses', [])) + 1
        guess_score = 0
        for i in range(5):
            if result[i] == 'correct' and guess[i] not in found_letters['correct']:
                guess_score += (7 - guess_number) * 20  # Points only for new correct letters
                found_letters['correct'].append(guess[i])
            elif result[i] == 'present' and guess[i] not in found_letters['present'] and guess[i] not in found_letters['correct']:
                guess_score += (7 - guess_number) * 5   # Points only for new present letters
                found_letters['present'].append(guess[i])

        # Only add the guess_score if it's not zero (i.e., the guess wasn't completely wrong)
        if guess_score > 0:
            score += guess_score

        # Add win bonus if the word is guessed correctly
        win_bonus = 0
        if game_over and guess == secret_word:
            win_bonus = (6 - guess_number) * 100  # More bonus for earlier wins
            score += win_bonus + time_bonus

        request.session['score'] = score
        request.session['found_letters'] = found_letters
        request.session['guesses'] = request.session.get('guesses', []) + [{'word': guess, 'result': result}]
        request.session.modified = True

        return JsonResponse({
            'result': result,
            'game_over': game_over,
            'secret_word': secret_word if game_over else None,
            'valid_word': True,
            'score': score,
            'time_bonus': time_bonus if game_over and guess == secret_word else 0,
            'win_bonus': win_bonus
        })

def new_game(request):
    if request.method == 'POST':
        secret_word = get_random_word()
        request.session['secret_word'] = secret_word
        request.session['guesses'] = []
        request.session['score'] = 0
        request.session['start_time'] = timezone.now().isoformat()
        request.session['found_letters'] = {'correct': [], 'present': []}
        return JsonResponse({'success': True})

def game(request):
    return render(request, 'scordle/game.html')

def get_timeout_word(request):
    secret_word = request.session.get('secret_word')
    if secret_word:
        return JsonResponse({'secret_word': secret_word})
    else:
        return JsonResponse({'error': 'No active game'})