from fastapi import Depends, APIRouter, HTTPException, UploadFile, File
from models import User, UserPictureUpdateURL, FollowRequest

import database_connect
from mysql.connector import Error
import os
import shutil
from auth_tools import AuthTool
from typing import Annotated


router = APIRouter()
UPLOAD_DIRECTORY = "profilePictures"
# si le dossier n'existe pas, le crée, si existe, ça ne fait pas d'erreur
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.get("/current", response_model=User)
async def get_user_name(token: Annotated[str, Depends(AuthTool.get_current_user)]):
    
    connection = database_connect.get_db_connection()
    cursor = connection.cursor()

    identifiant = token
    print(identifiant)
    identifiant = int(identifiant)
    print(identifiant)

    try: 
        cursor.execute("SELECT * from user where id = %s;", [identifiant, ])
        user_data = cursor.fetchone()

        # récupérer les données sous forme d'User
        user = User(
                id = user_data[0],
                username = user_data[1],
                is_admin = user_data[2],
                email = user_data[3],
                date_inscription = user_data[5],
                picture = user_data[6]
            )
        
        return user
    
   
    finally:
        cursor.close()
        connection.close() 

# Récupérer un user de la db 
@router.get("/{user_id}", response_model=User)
def get_user_from_db(user_id: int):
    connection = database_connect.get_db_connection()
    cursor = connection.cursor()

    try: 
        cursor.execute("SELECT * from user where id = %s;", (user_id,))
        user_data = cursor.fetchone()

        if user_data is None:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        # récupérer les données sous forme d'User
        user = User(
                id = user_data[0],
                username = user_data[1],
                is_admin = user_data[2],
                email = user_data[3],
                date_inscription = user_data[5],
                picture = user_data[6]
            )
        
        return user
    
    except Error as e:
        print(f"L'erreur suivante est survenue : '{e}'")
        raise HTTPException(status_code=500, detail="Erreur de connexion à la base de données")
    
    finally:
        cursor.close()
        connection.close()  

# Changer pp : URL
@router.post("/{user_id}/uploadImgUrl")
def upload_img_url(user_id: int, data: UserPictureUpdateURL):
    connection = database_connect.get_db_connection()
    cursor = connection.cursor()

    try : 
        cursor.execute("UPDATE user SET picture = %s WHERE id = %s", (data.url, user_id))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        return {"message": "URL de l'image enregistrée avec succès"}

    except Error as e:
        print(f"L'erreur suivante est survenue : '{e}'")
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement de l'URL de l'image")

    finally:
        cursor.close()
        connection.close()

# Changer pp : local
@router.post("/{user_id}/uploadImgLocal")
async def upload_img_local(user_id: int, file: UploadFile=File(...)): # Gestion du fichier uploadé : ici, réception du fichier  
    connection = database_connect.get_db_connection()
    cursor = connection.cursor()
    
    # je renomme le fichier en user_idPP pour éviter qu'un utilisateur écrase une image avec une autre du même nom 
    file_extension = file.filename.split('.')[-1]
    new_filename = f"{user_id}_ProfilePicture.{file_extension}"
    file_location = os.path.join(UPLOAD_DIRECTORY, file.filename) #os.path.join gère les potentielles erreurs liées à la concaténation du chemin 

    try: 
        # copier l'image
        with open(file_location, "wb") as file_object: #wb : write binary
            shutil.copyfileobj(file.file, file_object) # shutil.copyfileobj(src, dst)
        
        # màj chemin bdd 
        cursor.execute("UPDATE user SET picture = %s WHERE id = %s", (file_location, user_id))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        return {"message": "Image uploadée et URL enregistrée avec succès"}

    except Exception as e:
        print(f"L'erreur suivante est survenue : '{e}'")
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement de l'image")

    finally:
        cursor.close()
        connection.close()

# Follow quelqu'un 
@router.post("/follow/{followed}")
async def get_new_follow(follow_request: FollowRequest):
    connection = database_connect.get_db_connection()
    cursor = connection.cursor()

    try : 
        cursor.execute("insert into follow (follower, followed) values (%s, %s);", (follow_request.follower, follow_request.followed))
        connection.commit()
        return {"Message" : "L'utilisateur 5 vient de follow l'utilisateur 7"}
    except Error as e:
        print(f"L'erreur suivante est survenue : '{e}'")
        return {"error": "Une erreur s'est produite lors du follow."}
    finally:
        cursor.close()
        connection.close()

# Vérifier si on follow la personne 
@router.get("/follow/{followed}/{follower}")
async def is_following(followed: int, follower: int):
    connection = database_connect.get_db_connection()
    cursor = connection.cursor()

    try : 
        cursor.execute("select * from follow where follower = %s and followed = %s", (follower, followed))
        result = cursor.fetchone()
        if not result :
            return {"follow_status":"no"}
        else : 
            return {"follow_status":"yes"}
    except Error as e:
        print(f"L'erreur suivante est survenue : '{e}'")
        return {"error": "Une erreur s'est produite, on ne sait pas si tu follow ou pas."}
    finally:
        cursor.close()
        connection.close()
        
        
        # Route pour delete un user
        