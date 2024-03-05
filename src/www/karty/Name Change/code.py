import os

for x in range(9):
    try:
        os.rename('Z_'+str(x)+'_Bohemian.png', 'Zaludy_'+str(x)+'.png')
    except FileNotFoundError:
        print(f"file does not exist.")

