import React from 'react';
import ProfileBanner from "../components/profileBanner.js"
import ChangePictureButtons from '../components/changePPButton.js';
import UserMessagesList from '../components/userMessages.js';
import { useState } from 'react';
import Message from '../components/Message.js';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
    const {user_id} = useParams();
    //Faire apparaître ou disparaître les boutons upload image
    const [showButtons, setShowButtons] = useState(false);
    const handleImageClick = () => {
        setShowButtons(!showButtons);}

    return (
        <div className="max-w-2xl mx-auto p-4">
            <ProfileBanner onImageClick={handleImageClick} user_id={user_id} />
            {showButtons && <ChangePictureButtons />}
            <Message user_id={user_id} />
        </div>
    );
};

export default ProfilePage;

//récup user id 
// le passer en param.


