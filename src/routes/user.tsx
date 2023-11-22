import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header';

interface UserData {
  login?: string;
  id: string
  avatar_url?: string;
  username: string;
  name: string;
  email?: string;
  bio?: string;
  blog?: string;
  html_url: string;
  twitter_username?: string | null;
  company?: string | null;
  followers?: number;
  following?: number;
  public_repos: number;
  repositories?: unknown[];
  password?: string
}

const UserDetails: React.FC = () => {
  const navigate = useNavigate()
  const { username } = useParams();
  const { user, token, logout } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editedUserData, setEditedUserData] = useState<Partial<UserData>>({});
  const [errors, setErrors] = useState<Partial<UserData>>({});

  const fetchUserData = async (username: string, accessToken: string) => {
    setLoading(true);
    setError(null);

    let userFound = false;

    try {
      const apiResponse = await axios.get(`http://localhost:3000/users/username/${username}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUserData(apiResponse.data as UserData);
      setLoading(false);
      userFound = true;
    } catch (apiError) {
      try {
        const githubResponse = await axios.get(`https://api.github.com/users/${username}`);
        setUserData(githubResponse.data as UserData);
        setLoading(false);
        userFound = true;
      } catch (githubError) {
        console.error('Erro ao buscar dados do usuário:', githubError);
      }
    } finally {
      if (!userFound) {
        setError('Falha ao carregar dados do usuário.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserData(username, token || '');
    }
  }, [username, token]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className='w-full flex justify-center items-center h-[100dvh]'><h1 className='text-red-500 text-center text-2xl font-semibold'>Erro: <span className='text-black font-normal text-2xl'>{error}</span></h1></div>;

  if (!userData) return <div>Nenhum usuário encontrado.</div>;

  const redirectToLink = (link: string) => {
    window.open(link, '_blank');
  };

  const handleEdit = async () => {
    // Validation for required fields and email format
    const validationErrors: Partial<UserData> = {};

    if (!editedUserData.username || editedUserData.username === '') {
      validationErrors.username = 'Tag de usuário é obrigatório';
    }

    if (!editedUserData.email || editedUserData.email === '') {
      validationErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUserData.email)) {
      validationErrors.email = 'Formato inválido';
    }

    if (!editedUserData.password || editedUserData.password === '') {
      validationErrors.password = 'Senha é obrigatório';
    } else if (editedUserData.password.length < 6) {
      validationErrors.password = 'Senha muito curta, minímo de seis caracteres';
    }

    // Set errors only if there are validation errors
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Proceed with the PATCH request if validations pass
    try {
      const { id } = userData

      const response = await axios.patch(
        `http://localhost:3000/users/${id}`,
        editedUserData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Assuming response.data contains updated user data
      setUserData(response.data as UserData);
      setIsEditing(false);

      toast.success("Dados atualizados corretamente!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Erro ao editar os dados do usuário:', error);
      if (axios.isAxiosError(error)) {
        const { message } = error.response.data
        if (message == 'Username already exists') {
          validationErrors.username = "Usuário já existente"
        }
        if (message == 'Email already exists') {
          validationErrors.email = "E-mail já existente"
        }
        setErrors(validationErrors)
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {user !== username && <Header />}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
        <h2 className="text-3xl font-semisemibold mb-6">Detalhes do usuário</h2>
        {isEditing && (
          <div className="mt-4">
            <label className="block font-semibold my-2">Tag do usuário:</label>
            <input
              type="text"
              placeholder="Username"
              value={editedUserData.username}
              onChange={(e) => setEditedUserData({ ...editedUserData, username: e.target.value })}
              className="w-full border rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.username && <i className="text-red-500">{errors.username}</i>}

            <label className="block font-semibold my-2">E-mail:</label>
            <input
              type="email"
              placeholder="Email"
              value={editedUserData.email}
              onChange={(e) => setEditedUserData({ ...editedUserData, email: e.target.value })}
              className="w-full border rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.email && <i className="text-red-500 ">{errors.email}</i>}

            <label className="block font-semibold my-2">Senha:</label>
            <input
              type="password"
              placeholder="Password"
              value={editedUserData.password || ''}
              onChange={(e) => setEditedUserData({ ...editedUserData, password: e.target.value })}
              className="w-full border rounded py-2 px-3 focus:outline-none focus:ring focus:border-blue-300"
            />
            {errors.password && <i className="text-red-500">{errors.password}</i>}
          </div>
        )}

        {userData && !isEditing && (
          <div className="mb-6 flex flex-col gap-4">
            {userData.avatar_url && (
              <div className="mt-4">
                <a className='flex w-max rounded-full' href={userData.html_url}>
                  <img
                    src={userData.avatar_url}
                    alt="Avatar"
                    className="rounded-full h-24 w-24 object-cover"
                  />
                </a>
              </div>
            )}
            {userData.name && <p className="font-semibold">Nome do usuário: <span className="font-normal">{userData.name}</span></p>}
            {userData.login && <p className="font-semibold">Tag do usuário: <span className="font-normal">{userData.login}</span></p>}
            {userData.email && <p className="font-semibold">E-mail: <span className="font-normal">{userData.email}</span></p>}
            {userData.bio && <p className="font-semibold">Bio: <span className="font-normal">{userData.bio}</span></p>}
            {userData.company && <p className="font-semibold">Nome da Empresa: <span className="font-normal">{userData.company}</span></p>}
            {userData.followers != null && <p className="font-semibold">Seguidores: <span className="font-normal">{userData.followers}</span></p>}
            {userData.following != null && <p className="font-semibold">Seguindo: <span className="font-normal">{userData.following}</span></p>}
            {userData.public_repos != null && (
              <button onClick={() => navigate(`/repositories/${username}`)} className="font-semibold text-left">
                Repositórios encontrados: <span className="text-blue-600 cursor-pointer">{userData.public_repos}</span>
              </button>
            )}
            {userData.blog && (
              <p className="font-semibold">
                Blog: <span className="text-blue-600 cursor-pointer" onClick={() => redirectToLink(userData.blog as string)}>{userData.blog}</span>
              </p>
            )}
            {userData.twitter_username && (
              <p className="font-semibold">
                Twitter: <span className="text-blue-600 cursor-pointer" onClick={() => redirectToLink(`https://twitter.com/${userData.twitter_username}`)}>{userData.twitter_username}</span>
              </p>
            )}
            {userData.html_url && (
              <p className="font-semibold">
                Github do usuário: <span className="text-blue-600 cursor-pointer" onClick={() => redirectToLink(userData.html_url)}>{userData.html_url}</span>
              </p>
            )}
          </div>
        )}
        {user == username && (
          <div className="mt-4 flex justify-between">
            <div>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleEdit();
                  } else {
                    setIsEditing(!isEditing)
                  }
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
              >
                {isEditing ? 'Salvar' : 'Editar'}
              </button>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
                >
                  Cancelar
                </button>
              )}
            </div>
            <button
              onClick={() => handleLogout()}
              className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sair
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserDetails;