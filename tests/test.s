.offset 0x0

# Выводит число 8 в регистр 1
test:
    addi x1, x0, 10
    # beq x1, x0, 4
    addi x1, x1, -2
    loop: jal x0, 0