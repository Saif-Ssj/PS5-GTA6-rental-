RATES = {
    (False, False): 8,   # normal
    (True, False): 10,   # + extra controller
    (False, True): 13,   # + extra screen
    (True, True): 15,    # + both
}

DISCOUNT_PER_DAY = 0.02   # 2% extra discount for each day after the first
MAX_DAYS = 31             # longest rental allowe

def estimate_price(days, extra_controller=False, extra_screen=False):
    if days < 1 or days > MAX_DAYS:
        raise ValueError("A rental must be at least 1 day.")
    rate = RATES[(extra_controller, extra_screen)]
    return round(rate * days / (1 + DISCOUNT_PER_DAY * (days - 1)))