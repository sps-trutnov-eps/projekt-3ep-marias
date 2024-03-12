import os
first_file_path = None
vykricnik = True
jmeno = 'Zaludy'

for x in range(8):
    try:
        os.rename('./Change/'+str(x)+'.jpg', './Renamed/'+jmeno+'_'+str(x+1)+'.jpg')
    except FileNotFoundError:
        for root, dirs, files in os.walk("./Change/"):
            if len(files) > 0:
                first_file_path = os.path.join(root, files[x])
                break
        if vykricnik != False:
            os.rename(first_file_path,os.path.join(root,str(x)+'!.jpg')) 
        else:
            os.rename(first_file_path,os.path.join(root,str(x)+'.jpg'))
