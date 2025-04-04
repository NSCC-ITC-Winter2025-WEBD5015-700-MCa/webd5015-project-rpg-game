'use client';

type DoorData = {
  travel_string: string;
  destination_id: string;
  door_description: string;
};

type LocationData = {
  doors: Record<string, DoorData>;
};

import { useState, useEffect, JSX } from 'react';
import { Copy, Check } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getLocationData } from '@/lib/db/queries';
import { setupActions, handleUserInput } from './commands';

export function Terminal(props: { player: any; }) {
  const [terminalContents, setTerminalContents] = useState<JSX.Element[]>([]);

  const user=props.player
  const TERMINAL_MAX = 100000;

  useEffect(() => {
    setupActions(user);

    const renderDoorDescriptions = (doors: Record<string, { door_description: string }>) => {
      const descriptions = Object.values(doors).map(door => door.door_description);
      return <p>{descriptions.join(" | ")}</p>;
    };

    const loadFirstRoom = async () => {
      let location_data = await getLocationData(user.location_id);
      let location_doors: any = location_data.doors
      let room_desc = 
      <>
        <p>{location_data.description}</p><br />
        { renderDoorDescriptions(location_doors) }
      </>
      setTerminalContents((prevPosts) => [...prevPosts, room_desc]);
    }

    loadFirstRoom()
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const playerInput = formData.get("gameInput") as string;
    event.currentTarget.reset()

    if(playerInput.split(" ").length==1 && playerInput.split(" ")[0].toLowerCase() == 'clear'){
      clearTerminal()
      return
    }

    let gameTerminal = document.getElementById("gameTerminal");
    if(!gameTerminal) return;

    // const output = await handleUserInput(playerInput);
    let playerAction = {
      'user': user,
      'input': playerInput,
    }

    const newPost = handleUserInput(playerAction);
    if (newPost) {
        setTerminalContents((prevPosts) => [...prevPosts, newPost]);
    }
  };

  const clearTerminal = () => {
    let gameTerminal = document.getElementById("gameTerminal");
    if(!gameTerminal) return;

    gameTerminal.innerHTML = "<div>» Game Window Cleared «</div><br>"
  }

  return (
      <>
      <div className="w-full h-[100%] rounded-lg shadow-lg overflow-hidden bg-gray-900 text-white font-mono text-sm">
        <div className="p-4 h-[100%]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              Game Terminal:
            </div>
          </div>
          <div id="gameTerminal" className="h-[90%] space-y-2 overflow-y-scroll">
            {terminalContents.map((post, index) => (
              <div key={index}>{post}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-auto my-2 rounded-lg shadow-lg overflow-hidden bg-gray-900 text-white font-mono text-sm">
        <form onSubmit={(handleSubmit)} className="my-2" autoComplete="off">
          <label className="w-[5%] float-left px-2" htmlFor="gameInput">Input: </label>
          <input className="w-[95%] m-auto outline-none" type="text" id="gameInput" name="gameInput" />
        </form>
      </div>
    </>
  );
}
