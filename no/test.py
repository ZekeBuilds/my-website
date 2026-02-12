import math

def format_sig_figs(x, precision=7):
    """Formats a number to strictly n significant figures."""
    if x == 0:
        return "0"
    # standard 'g' format does sig figs but drops trailing zeros. 
    # This ensures we see the precision requested.
    return f"{x:.{precision}g}"

def chop(val, sig_figs=5):
    """
    Truncates (chops) a value to a specific number of significant figures.
    Used for simulating limited-precision arithmetic (Problem 5).
    """
    if val == 0:
        return 0
    
    sign = 1 if val > 0 else -1
    val = abs(val)
    
    # Calculate magnitude
    magnitude = math.floor(math.log10(val))
    
    # Calculate shift factor to move decimal point
    # We want to keep 'sig_figs' digits
    factor = 10 ** (sig_figs - 1 - magnitude)
    
    # Shift, Truncate (int implies floor/chop for positive), then Unshift
    chopped_val = math.trunc(val * factor) / factor
    
    return sign * chopped_val

# (Insert global helper functions here - specifically 'chop')

x = 3.476
true_y = x**3 - 8*x**2 + 12*x - 0.45

print(f"True Value: {format_sig_figs(true_y, 7)}")
print("-" * 50)

# --- Part A: Standard Polynomial y = x^3 - 8x^2 + 12x - 0.45 ---
# Every operation result must be chopped to 5 sig figs immediately.

# 1. x^2
x2 = chop(x * x, 5)
# 2. x^3
x3 = chop(x2 * x, 5)
# 3. 8x^2
t_8x2 = chop(8 * x2, 5)
# 4. 12x
t_12x = chop(12 * x, 5)
# 5. x^3 - 8x^2
sub1 = chop(x3 - t_8x2, 5)
# 6. (x^3 - 8x^2) + 12x
add1 = chop(sub1 + t_12x, 5)
# 7. Final subtract 0.45
y_a = chop(add1 - 0.45, 5)

et_a = abs((true_y - y_a)/true_y) * 100

print("Part A (Standard):")
print(f"  Result: {format_sig_figs(y_a, 7)}") # Result has 5 sig figs, but fit to column
print(f"  Et    : {format_sig_figs(et_a, 4)}%")

# --- Part B: Nested Form y = ((x-8)x + 12)x - 0.45 ---

# 1. x - 8
step1 = chop(x - 8, 5)
# 2. * x
step2 = chop(step1 * x, 5)
# 3. + 12
step3 = chop(step2 + 12, 5)
# 4. * x
step4 = chop(step3 * x, 5)
# 5. - 0.45
y_b = chop(step4 - 0.45, 5)

et_b = abs((true_y - y_b)/true_y) * 100

print("-" * 50)
print("Part B (Nested):")
print(f"  Result: {format_sig_figs(y_b, 7)}")
print(f"  Et    : {format_sig_figs(et_b, 4)}%")