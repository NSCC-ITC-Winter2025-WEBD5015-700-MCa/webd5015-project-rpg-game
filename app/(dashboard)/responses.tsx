import responses from './responses.json';

const commandList = Object.keys(responses);
const commandsPerColumn = Math.ceil(commandList.length / 2);

const column1 = commandList.slice(0, commandsPerColumn)
const column2 = commandList.slice(commandsPerColumn)

export function Help() {
    return <>
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
}