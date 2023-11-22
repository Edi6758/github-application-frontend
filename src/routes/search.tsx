/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

const Search = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [inputError, setInputError] = useState('');
  const [authorId, setAuthorId] = useState<string | null>(null)

  const { user, token } = useAuth()

  const getUserId = async (user: string) => {
    try {
      const apiResponse = await axios.get(`http://localhost:3000/users/username/${user}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { id } = apiResponse.data
      setAuthorId(id)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getUserId(user || '');
  }, [user, token]);

  const handleSearch = async () => {
    if (!username.trim()) {
      setInputError('Por favor, preencha o campo');
      return;
    }

    try {
      setInputError('');

      const reposResponse = await axios.get(`http://localhost:3000/repos/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const foundRepos = reposResponse.data.data.length;
      const status = foundRepos > 0 ? 'found' : 'not-found';

      if (status === 'found') {
        try {
          await axios.post(
            `http://localhost:3000/search-history-logs`,
            {
              username,
              status,
              foundRepos,
              authorId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          navigate(`/repositories/${username}`);
        } catch (error) {
          console.error(error);
        }
      } else {
        setInputError('Nenhum repositório foi encontrado');
      }
    } catch (error) {
      setInputError('Parece que o usuário não existe');
      console.error('Error fetching repositories:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Header />
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-full max-w-md">
        <h2 className="text-center text-3xl font-semibold mb-6">Busca por usuário</h2>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            Username do GitHub
          </label>
          <input
            type="text"
            id="username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setInputError('');
            }}
          />
          {inputError && <p className="text-red-500 text-sm mt-1">{inputError}</p>}
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSearch}
          >
            Buscar
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => navigate('/history')}
          >
            Histórico de busca
          </button>
        </div>
      </div>
    </div>
  );
};

export default Search;
