import math

# --- HELPER FUNCTIONS ---
def chop(x, sig_figs=5):
    """Truncates x to sig_figs."""
    if x == 0: return 0
    sign = 1 if x > 0 else -1
    x = abs(x)
    magnitude = math.floor(math.log10(x))
    factor = 10**(sig_figs - 1 - magnitude)
    chopped = int(x * factor) / factor
    return sign * chopped

def round_sig_err(x):
    """Rounds error to 4 sig figs (for percentage)."""
    if x == 0: return 0
    mag = math.floor(math.log10(abs(x)))
    fac = 10**(4 - 1 - mag)
    return int(x * fac + 0.5) / fac

def format_output(x, sig_figs=5):
    """Formats output matching the arithmetic precision."""
    if x == 0: return "0"
    magnitude = math.floor(math.log10(abs(x)))
    decimals = sig_figs - 1 - magnitude
    if decimals >= 0:
        return f"{x:.{decimals}f}"
    else:
        return f"{x:.{sig_figs}g}"

# --- INPUTS ---
x = 3.476
true_y_raw = x**3 - 8*x**2 + 12*x - 0.45
# We display the true value to 7 sig figs as a reference
true_y_disp = int(true_y_raw * 10**6 + 0.5) / 10**6 

print("=== PROBLEM 5: STEP-BY-STEP CHOPPING (5 SIG FIGS) ===\n")
print(f"True Value (Reference): {format_output(true_y_disp, 7)}")
print("-" * 60)

# --- PART A: Standard Polynomial ---
print("PART A: Standard Polynomial y = x^3 - 8x^2 + 12x - 0.45")

# Step 1: x^2
x2_raw = x * x # 12.082576
x2 = chop(x2_raw)
print(f"1. x^2        : {x} * {x} = 12.082576 -> Chop -> {format_output(x2)}")

# Step 2: x^3
x3_raw = x2 * x # 12.082 * 3.476 = 41.997032
x3 = chop(x3_raw)
print(f"2. x^3        : {format_output(x2)} * {x} = {x3_raw:.6f}... -> Chop -> {format_output(x3)}")

# Step 3: 8x^2
t_8x2_raw = 8 * x2 # 96.656
t_8x2 = chop(t_8x2_raw)
print(f"3. 8x^2       : 8 * {format_output(x2)} = {t_8x2_raw} -> Chop -> {format_output(t_8x2)}")

# Step 4: 12x
t_12x_raw = 12 * x # 41.712
t_12x = chop(t_12x_raw)
print(f"4. 12x        : 12 * {x} = {t_12x_raw} -> Chop -> {format_output(t_12x)}")

# Step 5: Subtraction (x^3 - 8x^2)
sub1_raw = x3 - t_8x2 # 41.997 - 96.656 = -54.659
sub1 = chop(sub1_raw)
print(f"5. x^3 - 8x^2 : {format_output(x3)} - {format_output(t_8x2)} = {sub1_raw} -> Chop -> {format_output(sub1)}")

# Step 6: Addition (+ 12x)
add1_raw = sub1 + t_12x # -54.659 + 41.712 = -12.947
add1 = chop(add1_raw)
print(f"6. + 12x      : {format_output(sub1)} + {format_output(t_12x)} = {add1_raw} -> Chop -> {format_output(add1)}")

# Step 7: Final Subtraction (- 0.45)
final_a_raw = add1 - 0.45 # -12.947 - 0.45 = -13.397
y_a = chop(final_a_raw)
print(f"7. - 0.45     : {format_output(add1)} - 0.45 = {final_a_raw} -> Chop -> {format_output(y_a)}")

# Error A
et_a = round_sig_err(abs((true_y_raw - y_a)/true_y_raw) * 100)
print(f"   Result A   : {format_output(y_a)}")
print(f"   Et (%)     : {format_output(et_a, 4)}%")
print("-" * 60)


# --- PART B: Nested Form ---
print("PART B: Nested Form y = ((x-8)x + 12)x - 0.45")

# Step 1: x - 8
s1_raw = x - 8 # -4.524
s1 = chop(s1_raw)
print(f"1. x - 8      : {x} - 8 = {s1_raw} -> Chop -> {format_output(s1)}")

# Step 2: * x
s2_raw = s1 * x # -4.524 * 3.476 = -15.725424
s2 = chop(s2_raw)
print(f"2. * x        : {format_output(s1)} * {x} = {s2_raw:.6f}... -> Chop -> {format_output(s2)}")

# Step 3: + 12
s3_raw = s2 + 12 # -15.725 + 12 = -3.725
s3 = chop(s3_raw)
print(f"3. + 12       : {format_output(s2)} + 12 = {s3_raw} -> Chop -> {format_output(s3)}")

# Step 4: * x
s4_raw = s3 * x # -3.725 * 3.476 = -12.9481
s4 = chop(s4_raw)
print(f"4. * x        : {format_output(s3)} * {x} = {s4_raw:.6f}... -> Chop -> {format_output(s4)}")

# Step 5: - 0.45
final_b_raw = s4 - 0.45 # -12.948 - 0.45 = -13.398
y_b = chop(final_b_raw)
print(f"5. - 0.45     : {format_output(s4)} - 0.45 = {final_b_raw} -> Chop -> {format_output(y_b)}")

# Error B
et_b = round_sig_err(abs((true_y_raw - y_b)/true_y_raw) * 100)
print(f"   Result B   : {format_output(y_b)}")
print(f"   Et (%)     : {format_output(et_b, 4)}%")