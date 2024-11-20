import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfileBanner = ({onImageClick, user_id}) => {
    const [user, setUser] = useState(null);
    const default_profile_picture = 'https://i.pinimg.com/564x/85/7d/0c/857d0c374458c8c273b21940af4ce0ce.jpg'
    const [error, setUserError] = useState(null);

    //useEffect évite une boucle de rendus infinis déclenchée par setUser
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:3310/user/${user_id}`);
                setUser(response.data)
            } catch (err) {
                setUserError(err.message);
            }
        }
        fetchUser();
    }, [user_id])

    //erreur : 
    if (error) {
        return <div>Erreur: {error}</div>;
      }
      //Si user n'est pas encore disponible lors du chargement de la page (évite erreur)
    if (!user) {
        return <div>Chargement...</div>;
    }

    //Conditions d'affichage PP : picture = null > default else url en ligne ou sur le serveur
    let pictureSrc = null;
    if (!user.picture) {
        pictureSrc = default_profile_picture;
    } else if (!user.picture.startsWith('http')) {
        pictureSrc = `http://localhost:3310/Server/${user.picture}`
    } else {
        pictureSrc = user.picture
    }
    


    return (
        <div className="flex justify-center items-center">
            <div className="flex bg-pink-500 p-1 rounded-lg shadow-lg w-full max-w-md mb-4 items-center">
                {/*onImageClick(cf profilePage) : faire apparaître changePPButton pour modifier la photo*/}
                <img onClick={onImageClick} src={pictureSrc} alt={`${user.username}'s profile`} className=" cursor-pointer w-10 h-10 p-1 ml-2 rounded-full ring-2 ring-white dark:pink-500"></img>
                <div className='ml-5'>
                    <div className='flex items-center'>
                        <h1 className="text-2xl font-bold text-left mr-5 text-white">{user.username}</h1>
                    </div>
                    <p className="text-sm text-left mr-5 text-white">Date d'inscription: {user.date_inscription}</p>
                </div>
                {/* INSERT ADDITIONAL INFORMATIONS : followers, notes, etc ? */}
            </div>
        </div>
    );
};

export default ProfileBanner;