/* eslint-disable react-hooks/exhaustive-deps */
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Supondo que você tenha um hook useAuth para obter informações do usuário
import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

const Header = () => {
  const { user } = useAuth();

  const placeholderUrl = 'https://via.placeholder.com/150x150'

  const [userProfile, setUserProfile] = useState<string>(placeholderUrl)

  const fetchUserData = async () => {
    try {
      const githubResponse = await axios.get(`https://api.github.com/users/${user}`);

      const { avatar_url } = githubResponse.data

      setUserProfile(avatar_url)
    } catch (error) {
      console.error("Erro:", (error as AxiosError).message)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [user]);

  return (
    <header className="fixed top-0 right-0 p-4 m-4 bg-white rounded-full shadow-md">
      <div className="flex items-center gap-4">
        <Link to={`/profile/${user}`} className="text-black text-xl font-semibold hover:underline">
          {user}
        </Link>
        <img src={userProfile} alt="Foto de perfil" className="w-10 h-10 rounded-full mr-2" />
      </div>
    </header>
  );
};

export default Header;
