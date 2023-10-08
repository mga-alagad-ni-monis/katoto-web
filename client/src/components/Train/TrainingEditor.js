import { useRef, useState, useEffect } from "react";

import yaml from "js-yaml";
import Editor from "@monaco-editor/react";

import { MdUpdate } from "react-icons/md";
import { FiUploadCloud, FiChevronDown } from "react-icons/fi";

function TrainingEditor({
  trainingData,
  handleSetFiles,
  selectedMode,
  handleTrain,
  socket,
}) {
  const monacoRef = useRef(null);
  const bottomRef = useRef(null);

  const [updatedTrainingData, setUpdatedTrainingData] = useState("");
  const [isOpenFileButton, setIsOpenFileButton] = useState(false);
  const [filterFile, setFilterFile] = useState("Domain file");
  const [file, setFile] = useState("domain");
  const [data, setData] = useState({});
  const [train, setTrain] = useState(false);
  const [shellLogs, setShellLogs] = useState([]);

  useEffect(() => {
    setData(trainingData?.domainFile);
  }, [trainingData]);

  useEffect(() => {
    setFilterFile("Domain File");
    setFile("domain");
  }, [selectedMode]);

  useEffect(() => {
    if (socket) {
      socket.on("displayData", (data) => {
        var buffer = new Uint8Array(data.data);
        var fileString = String.fromCharCode.apply(null, buffer);
        setShellLogs((shellLogs) => [...shellLogs, fileString]);
      });
    }
  }, [train]);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [shellLogs]);

  const handleEditorDidMount = (editor, monaco) => {
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value) => {
    setUpdatedTrainingData(
      yaml.load(value, {
        lineWidth: -1,
      })
    );
  };

  const handleEditorValidation = (markers) => {
    markers.forEach((marker) => console.log("onValidate:", marker.message));
  };

  const changeFile = (i) => {
    setFilterFile(i);
    setIsOpenFileButton(!isOpenFileButton);
    if (i === "Domain file") {
      setData(trainingData?.domainFile);
      setFile("domain");
    } else if (i === "NLU file") {
      setData(trainingData?.nluFile);
      setFile("nlu");
    } else if (i === "Rules file") {
      setData(trainingData?.rulesFile);
      setFile("rules");
    } else if (i === "Stories file") {
      setData(trainingData?.storiesFile);
      setFile("stories");
    }
  };

  const files = ["Domain file", "NLU file", "Rules file", "Stories file"];

  const getDate = () => {
    const date = new Date();
    const options = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  return (
    <div>
      <div className="flex justify-between mb-5 mt-5">
        <div className="hs-dropdown relative inline-flex gap-5">
          <button
            type="button"
            className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
            onClick={() => {
              setIsOpenFileButton(!isOpenFileButton);
            }}
          >
            {filterFile}
            <FiChevronDown size={16} />
          </button>
          <div
            className={`${
              isOpenFileButton ? "visible" : "hidden"
            } absolute top-9 transition-all duration-100 w-72
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
          >
            {files.map((i, k) => {
              return (
                <button
                  key={k}
                  className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                  onClick={() => {
                    changeFile(i);
                  }}
                >
                  {i}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-5">
          {train ? (
            <button
              className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
              onClick={() => {
                setTrain(false);
                setShellLogs([]);
              }}
            >
              <MdUpdate size={16} />
              Close
            </button>
          ) : (
            <button
              className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
              onClick={() => {
                if (
                  window.confirm(
                    "Do you want to proceed? This will overwrite your current chatbot data!"
                  )
                ) {
                  handleSetFiles(updatedTrainingData, file);
                }
              }}
            >
              <MdUpdate size={16} />
              Update
            </button>
          )}
          <button
            className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
            onClick={() => {
              if (
                window.confirm(
                  "Do you want to proceed with the training? This will overwrite your current chatbot model!"
                )
              ) {
                handleTrain();
                setTrain(true);
              }
            }}
          >
            <FiUploadCloud size={16} />
            Train
          </button>
        </div>
      </div>

      {train ? (
        <div className="bg-black rounded-lg shadow-lg text-sm text-[--light-brown] p-10 max-h-[624px] h-[624px] overflow-y-auto">
          {shellLogs.map((i, k) => {
            return (
              <div className="mb-4 flex gap-2" key={k}>
                <div className="w-[170px]">{getDate()}</div>
                <div className="w-full">{i}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      ) : (
        <Editor
          height="624px"
          defaultLanguage="yaml"
          value={yaml.dump(data, {
            lineWidth: -1,
          })}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          onChange={handleEditorChange}
          onValidate={handleEditorValidation}
        />
      )}
    </div>
  );
}

export default TrainingEditor;
