/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from 'swr';
import axiosInstance from "@/lib/axios";
import { useEffect, useMemo, useState } from 'react';
import GameCard from "../gameCard";
import NavigationBar from "../navigation-bar";
import { Trophy } from "lucide-react";
import Footer from "../footer";
import LoadingScreen from "../loading-screen";

const Wing = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    version="1.1"
    x="0px"
    y="0px"
    viewBox="0 0 100 125"
    enableBackground="new 0 0 100 100"
    xmlSpace="preserve"
    className={className}
  >
    <path d="M49.942,52.994c13.552-0.488,27.103-0.977,40.653-1.465c-2.527-4.177-3.159-7.831-7.989-8.461  c-7.229-0.94-14.458-1.883-21.688-2.826c-14.023-1.827-28.05-3.654-42.075-5.48C20.101,36.792,39.724,53.361,49.942,52.994z" />
    <path d="M0,9.786c4.391,7.257,26.615,23.072,32.953,23.886c17.33,2.231,34.657,4.46,51.986,6.688  c-3.393-5.607-4.18-9.35-10.312-10.959c-8.904-2.341-17.812-4.683-26.717-7.023C31.94,18.182,15.97,13.984,0,9.786z" />
    <path d="M63.108,66.207c10.413-2.219,20.826-4.439,31.241-6.66c-2.028-3.346-2.034-5.359-5.827-5.189  c-6.158,0.273-12.314,0.549-18.471,0.822c-11.343,0.506-22.686,1.014-34.028,1.518C37.298,58.064,54.94,67.947,63.108,66.207z" />
    <path d="M87.682,90.213c5.725-3.719,7.262-7.721,10.519-13.807c3.651-6.824,1.257-7.844-2.821-14.596  c-0.417-0.688-5.842,0.232-6.453,0.904c-0.745,0.818-0.248,5.455-0.294,6.496C88.315,76.211,87.998,83.213,87.682,90.213z" />
    <path d="M86.35,63.447c-3.795,0.809-8.604,0.191-9.572,4.229c-1.373,5.736-2.746,11.475-4.12,17.211  C81.904,82.678,86.028,71.582,86.35,63.447z" />
    <path d="M74.666,66.121c-9.148,1.953-8.956,4.611-12.879,13.18C68.007,78.711,73.811,71.941,74.666,66.121z" />
  </svg>
)

type Player = {
  id_game?: string | number;
  name?: string;
  point?: number;
  [k: string]: any;
}

type GameLeaderboard = {
  game_id: number;
  game_name: string;
  leaderboard: Record<string, Player> | Player[];
  [k: string]: any;
}

type LeaderboardApiResponse = {
  data?: Record<string, GameLeaderboard> | GameLeaderboard[];
}

function useGames() {
  const { data, error } = useSWR('/games', (url: string) => axiosInstance.get(url).then(r => r.data?.data), { revalidateOnFocus: false });
  return {
    highlight: data ?? [],
    isLoading: !data && !error,
    error,
  };
}

// export default function Leaderboard() {
//   return <MaintenanceScreen />
// }

export default function Leaderboard() {

  const { data, error } = useSWR<LeaderboardApiResponse>('/leaderboard', (url: string) => axiosInstance.get(url).then(r => r.data), { revalidateOnFocus: false });
  const { highlight, isLoading: gamesLoading } = useGames();

  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  useEffect(() => {
    // When leaderboard data loads, pick the first available game if none selected
    // (we don't set state during render; effect runs after first paint)
    const leaderboardData = data?.data ?? {};
    const gamesArray: GameLeaderboard[] = Array.isArray(leaderboardData)
      ? leaderboardData
      : Object.values(leaderboardData as Record<string, GameLeaderboard>);

    if (selectedGameId == null && gamesArray.length > 0) {
      setSelectedGameId(gamesArray[0].game_id);
    }
  }, [data, selectedGameId]);

  // Memoize leaderboardData so hooks depending on it are stable and called unconditionally
  const leaderboardData = useMemo(() => data?.data ?? {}, [data]);

  const games = useMemo(() => {
    const arr = Array.isArray(leaderboardData)
      ? leaderboardData
      : Object.values(leaderboardData as Record<string, GameLeaderboard>);
    return arr.map(g => ({ id: g.game_id, name: g.game_name }));
  }, [leaderboardData]);

  const selectedGame: GameLeaderboard | undefined = useMemo(() => {
    const arr = Array.isArray(leaderboardData)
      ? leaderboardData
      : Object.values(leaderboardData as Record<string, GameLeaderboard>);
    return arr.find(g => g.game_id === selectedGameId) ?? arr[0];
  }, [leaderboardData, selectedGameId]);

  const players: Player[] = useMemo(() => {
    if (!selectedGame) return [];
    const lb = selectedGame.leaderboard;
    return Array.isArray(lb) ? lb : Object.values(lb ?? {});
  }, [selectedGame]);

  const sortedPlayers = useMemo(() => players.slice().sort((a, b) => (b?.point ?? 0) - (a?.point ?? 0)), [players]);

  if (error) return <div className="text-red-500">Gagal memuat data</div>;
  if (!data) return <LoadingScreen />;

  return (
    <div className="grid grid-cols-1 h-full bg-gray-900">
      <div className='lg:px-20 lg:py-14'>
        <NavigationBar />
      </div>

      <div className="hidden font-supertall lg:flex h-[60vh] justify-center before:hidden before:absolute before:w-full before:h-full before:content-['a'] bg-center bg-[url('/images/optimized/hall_backdrop.webp')] bg-blend-lighten bg-gray-900 bg-cover bg-no-repeat">
        <h1 className="[text-shadow:_0px_5px_16px_#000000] relative z-10 uppercase text-white my-auto font-extrabold text-center text-8xl">Hall Of Fame</h1>
      </div>

      <div className="h-full font-supertall bg-center lg:py-5">
        <div className="grid grid-cols-1 gap-4 mt-5 relative z-10">
          <div className="grid grid-cols-1 w-full place-items-center gap-5 lg:mb-5">
            <h1 className="[text-shadow:_0px_5px_16px_#000000] uppercase text-white font-extrabold text-center text-3xl lg:hidden">Hall Of Fame</h1>
          </div>

          {!gamesLoading && (
            <section className="relative w-full mb-20">
              <div className='grid grid-cols-1 justify-items-center'>
                <div className='text-white font-supertall bg-red-600 text-xl lg:text-2xl lg:px-10 px-3 py-2 rounded-lg lg:mb-5 h-fit text-center uppercase'>
                  <h1># Trending E-SPORTS GAMES</h1>
                </div>
                <div className='flex gap-10 mt-5 font-rocker w-full'>
                  <GameCard slides={highlight} options={{ loop: true }} />
                </div>
              </div>
              <div className="bg-[#DC2626] shadow-[inset_0_-33px_113px_rgba(0,0,0,0.25)] absolute h-[196px] lg:h-80 w-[100%] -bottom-10"></div>
            </section>
          )}

        </div>
      </div>

      {/* Mobile / Tablet view */}
      <MobileLeaderboard
        games={games}
        selectedGame={selectedGame}
        selectedGameId={selectedGameId}
        onSelectGame={setSelectedGameId}
        players={sortedPlayers}
      />

      {/* Desktop view */}
      <DesktopLeaderboard
        games={games}
        selectedGame={selectedGame}
        selectedGameId={selectedGameId}
        onSelectGame={setSelectedGameId}
        players={sortedPlayers}
      />

      <Footer />
    </div>
  );
}

/* Small presentational components kept local for readability */
function MobileLeaderboard({ games, selectedGame, selectedGameId, onSelectGame, players }: {
  games: { id: number; name: string }[];
  selectedGame?: GameLeaderboard;
  selectedGameId: number | null | undefined;
  onSelectGame: (id: number | null) => void;
  players: Player[];
}) {
  if (games.length === 0) return (
    <div className="text-center font-supertall lg:hidden text-white text-2xl py-10">Belum ada Ranking yang Tercatat</div>
  );

  if (!selectedGame) return (
    <div className="text-center font-supertall lg:hidden text-white text-2xl py-10">Belum ada Ranking yang Tercatat</div>
  );

  return (
    <div className="grid grid-cols-1 font-supertall lg:hidden relative z-10 px-5 py-5">
      <p className="text-xl text-white pb-4">Games List</p>
      <div className="grid grid-cols-1 gap-1">
        {games.map((game) => (
          <div
            key={game.id}
            className={`flex text-white items-center cursor-pointer ${selectedGameId === game.id ? 'font-bold text-red-700' : ''}`}
            onClick={() => onSelectGame(game.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
            </svg>
            <p className="uppercase md:text-base justify-center">{game.name}</p>
          </div>
        ))}
      </div>

      <div className="text-xl uppercase rounded-md text-white text-center pt-10">
        <Trophy className="size-20 mx-auto" />
        ESI DENPASAR
        <br />
        TOP {selectedGame?.game_name ?? 'Game'} ESPORT PLAYERS
      </div>

      <div className="grid grid-cols-1 bg-gray-900 text-white font-semibold mt-5">
        <table className="uppercase">
          <thead>
            <tr>
              <td className="text-start md:text-base font-light">Rank</td>
              <td className="text-start md:text-base font-light">Nama Player</td>
              <td className="text-start md:text-base font-light">Points</td>
            </tr>
          </thead>
          <tbody className="text-sm md:text-base font-sans">
            {players.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-white font-supertall text-2xl">Belum ada Peringkat</td>
              </tr>
            ) : (
              players.map((player, index) => (
                <tr key={`${selectedGame?.game_id ?? 'no-game'}-${player.id_game ?? index}`}>
                  <td>#{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.point} PTS</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DesktopLeaderboard({ games, selectedGame, selectedGameId, onSelectGame, players }: {
  games: { id: number; name: string }[];
  selectedGame?: GameLeaderboard;
  selectedGameId: number | null | undefined;
  onSelectGame: (id: number | null) => void;
  players: Player[];
}) {
  if (games.length === 0) return (
    <div className="text-center font-supertall hidden lg:inline text-white text-2xl py-10">Belum ada Ranking yang Tercatat</div>
  );

  if (!selectedGame) return (
    <div className="text-center font-supertall hidden lg:inline text-white text-2xl py-10">Belum ada Ranking yang Tercatat</div>
  );

  return (
    <div className="hidden lg:flex flex-col text-white px-5 py-5 text-2xl font-supertall">
      <div className="flex justify-center w-full ">
        <p className="text-3xl p-2 uppercase rounded-md text-white flex">
          <Wing className="size-20 fill-white transform -translate-y-4" />
          ESI DENPASAR TOP {selectedGame?.game_name ?? "Game"} E-SPORT PLAYERS
          <Wing className="-scale-x-100 size-20 fill-white transform -translate-y-4" />
        </p>
      </div>

      <div className="grid grid-cols-12 pb-20 px-10 h-full my-auto">
        <div className="flex flex-col gap-2 w-full col-span-3">
          <p className="text-xl text-white flex gap-2">Games List</p>
          {games.map((game) => (
            <div key={game.id} className={`flex text-white items-center cursor-pointer ${(selectedGameId === game.id) ? 'font-bold text-red-700' : ''}`} onClick={() => onSelectGame(game.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
              </svg>
              <p className="uppercase md:text-base justify-center">{game.name}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-center col-span-8 overflow-x-auto">
          <table className="uppercase text-lg text-white w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-4">Rank</th>
                <th className="text-left py-2 px-4">Nama Player</th>
                <th className="text-left py-2 px-4">Points</th>
              </tr>
            </thead>
            <tbody className="font-sans">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-white text-2xl py-4">Belum ada Peringkat</td>
                </tr>
              ) : (
                players.map((player, index) => (
                  <tr key={`${selectedGame?.game_id ?? 'no-game'}-${player.id_game ?? index}`}>
                    <td className="py-2 px-4">#{index + 1}</td>
                    <td className="py-2 px-4">{player.name}</td>
                    <td className="py-2 px-4">{player.point} PTS</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
