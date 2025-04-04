'use client';

type DoorData = {
  travel_string: string;
  destination_id: string;
  door_description: string;
};

type LocationData = {
  doors: Record<string, DoorData>;
};

import { JSX } from 'react';
import responses from './responses.json';
import { getLocationData, setUserLocation } from '@/lib/db/queries';

let current_player: { id: number; name: any; location_id: string}

let current_location_data: { location_id: string; description: string; doors: unknown; }
let current_location_door_data: any

export const setupActions = async (user: { id: number; name: any; location_id: string; }) => {
    current_player = user
    let player_location_id = user.location_id

    await setCurrentLocationData(player_location_id)
    return handleLook()
}

const setCurrentLocationData = async (player_location: string) => {
  let location_data =  await getPlayerLocationData(player_location);
  current_location_data = location_data
  current_location_door_data = location_data.doors
}

export const handleUserInput = (player_input: any): JSX.Element | null => {
  let location = player_input.user.location_id
  let player_name = player_input.user.name
  let split_input_array = player_input.input.split(" ");
  let first_string = split_input_array.shift()?.toLowerCase() || "";
  let rest_of_input = split_input_array.join(" ");

  console.log(first_string)

  if (split_input_array.length === 0) {
      switch (first_string) {
          case "?":
              return <Help />;
          case "say":
              return <p>What would you like to say?</p>;
          case "walk":
              return <p>Where would you like to go?</p>;
          case "look":
              return(
                <>
                  <p>You look around.</p><br />
                  { handleLook() }
                </>
              );
          default:
              return <p>Unknown command.</p>;
      }
  } else {
      switch (first_string) {
          case "say":
              return (
                  <p>
                      <span className="text-blue-300">{ player_name }</span> Says: "{rest_of_input}"
                  </p>
              );
          case 'walk':
            let direction_string = split_input_array[0].toLowerCase()
            return (
              <div>
                { handleWalk(direction_string) }
              </div>
            )
          break;
          default:
              return <p>Unknown command.</p>;
      }
  }
};

export function Help() {
  const commandList = Object.keys(responses);
  const commandsPerColumn = Math.ceil(commandList.length / 2);

  const column1 = commandList.slice(0, commandsPerColumn)
  const column2 = commandList.slice(commandsPerColumn)

  return (
    <>
      <span className="font-bold">HELP:</span>
      <p>Try These Commands:</p>
      <div className="flex">
        <ul className="w-1/2">
          { column1.map((content, index)=>{
              return<li>${ content }</li>
          })}
        </ul>
        <ul className="w-1/2">
        { column2.map((content, index)=>{
              return<li>${ content }</li>
          })}
        </ul>
      </div>
    </>
  );
}

const getPlayerLocationData = async (player_location: string) =>{
    let location_data =  await getLocationData(player_location);
    if(!location_data) {
        console.log(`Error: No location data found for location id ${player_location}, returning to Castle Courtyard.`)
        location_data =  await getLocationData(`castle_courtyard`);
    }
    return location_data
}

const setPlayerLocation = async (userId:number, new_location: string) =>{
    console.log(new_location)
    await setUserLocation(userId, new_location)
    setCurrentLocationData(new_location)
    console.log(current_player.location_id)
    // current_location_door_data = current_location_data.doors
}

const handleWalk = (direction: string)=>{
  let destination_id
  let travel_string
  for (const [door_direction, doorData] of Object.entries(current_location_door_data) as [string, {
      travel_string: string;
      destination_id: string;
      door_description: string;
    }][]) {
      if(door_direction == direction){
          destination_id = doorData.destination_id
          travel_string= doorData.travel_string
      }
    }

  if (!destination_id){
    return (`That is not a valid direction.`)
  } else {
    setPlayerLocation(current_player.id, destination_id)
    return(`${travel_string}`)
  }
}

const handleLook = () => {

  const renderDoorDescriptions = (doors: Record<string, { door_description: string }>) => {
    const descriptions = Object.values(doors).map(door => door.door_description);
    return <p>{descriptions.join(" | ")}</p>;
  };

  return(
    <>
      <p>{current_location_data.description}</p><br />
      { renderDoorDescriptions(current_location_door_data) }
    </>
  )
}