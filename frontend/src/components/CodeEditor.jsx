import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useSelector, useDispatch } from "react-redux";
import socket from "../socket/socket.js";
import axios from "axios";
import { setCode, setLanguage, setOutput, setInput } from "../redux/slices/editorSlice";
import toast from "react-hot-toast";

const CodeEditor = () => {
  const roomDetails = useSelector((state) => state.room.room);
  const participants = useSelector((state) => state.room.participants);
  const user = useSelector((state) => state.auth.user);
  const { code, language, output, input } = useSelector((state) => state.editor);

  const dispatch = useDispatch();

  const roomId = roomDetails?.roomId || "";
  const roomName = roomDetails?.name || "";

  // language mapping Judge0 <-> Monaco
  const languageMap = {
    63: "javascript", // JavaScript (Node.js 12.14.0)
    74: "typescript", // TypeScript (3.7.4)
    71: "python", // Python (3.8.1)
    62: "java", // Java (OpenJDK 13.0.1)
    50: "c", // C (GCC 9.2.0)
    54: "cpp", // C++ (GCC 9.2.0)
    43: "plaintext", // HTML/CSS fallback
  };

  const [myRole, setMyRole] = useState("no role");

  // get myRole
  useEffect(() => {
    if (participants && user) {
      const myParticipant = participants?.find(
        (p) => p?.user?._id === user?._id
      );

      setMyRole(myParticipant?.role || "no role");
    }
  }, [participants, user]);

  //join-room - socket.io
  useEffect(() => {
    if (roomId) {
      socket.emit("join-room", roomId);
    }
  }, [roomId]);

  //update-code - socket.io
  useEffect(() => {
    socket.on("code-update", (newCode) => {
      dispatch(setCode(newCode));
    });

    return () => {
      socket.off("code-update");
    };
  }, [dispatch]);

  // update-language - socket.io
  useEffect(() => {
    socket.on("language-update", (newLang) => {
      dispatch(setLanguage(newLang));
    });

    return () => {
      socket.off("language-update");
    };
  }, [dispatch]);

  // input/output-update - socket.io
  useEffect(() => {
    socket.on("input-update", (newInput) => dispatch(setInput(newInput)));
    socket.on("output-update", (newOutput) => dispatch(setOutput(newOutput)));

    return () => {
      socket.off("input-update");
      socket.off("output-update");
    };
  }, [dispatch]);

  //handle Code change - socket.io
  const canEdit = !roomId || myRole === "owner" || myRole === "editor";
  const handleCodeChange = (value) => {
    if (canEdit) {
      dispatch(setCode(value));
      if (roomId) {
        socket.emit("code-change", { roomId, code: value });
      }
    }
  };

  // handle language change - socket.io
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    dispatch(setLanguage(newLang));

    if (roomId && myRole === "owner") {
      socket.emit("language-change", { roomId, language: newLang });
    }
  };

  // handle run code
  const runCode = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/execute`,
        {
          language_id: parseInt(language),
          source_code: code,
          stdin: input || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      // Judge0 response may contain stdout, stderr, or compile_output
      if (data.stdout) handleOutputChange(data.stdout);
      else if (data.stderr) handleOutputChange(data.stderr);
      else if (data.compile_output) handleOutputChange(data.compile_output);
      else handleOutputChange("No output");
    } catch (err) {
      // console.error("Execution error:", err);
      handleOutputChange("Error executing code");
    }
  };

  //handle input change
  const handleInputChange = (e) => {
    const newInput = e.target.value;
    dispatch(setInput(newInput));

    if (roomId) {
      socket.emit("input-change", { roomId, input: newInput });
    }
  };

  // handle update output
  const handleOutputChange = (newOutput) => {
    dispatch(setOutput(newOutput));

    if (roomId) {
      socket.emit("output-change", { roomId, output: newOutput });
    }
  };

  // handle save code
  const handleSaveCode = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/history/save-code`,
        {
          roomId,
          code,
        },
        {
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save code");
    }
  };

  return (
    <div className="h-full overflow-hidden dark:bg-slate-950 dark:text-white flex flex-col">
      {/* ===== Header ===== */}
      <div className="w-full p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/10 dark:bg-slate-900 border-b border-gray-700">
        {roomDetails && <div className="space-y-1 text-sm sm:text-base">
          <h1 className="font-semibold">
            Room Name: <span className="font-normal">{roomName}</span>
          </h1>
          <p>
            RoomID: <span className="font-normal">{roomId}</span>
          </p>
        </div>}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <select value={language} onChange={handleLanguageChange} disabled={!canEdit} className="border border-blue-500 rounded-md px-2 py-1 text-sm w-full sm:w-auto dark:text-black">
            <option value="63">JavaScript (Node.js)</option>
            <option value="74">TypeScript</option>
            <option value="71">Python</option>
            <option value="62">Java</option>
            <option value="50">C</option>
            <option value="54">C++</option>
            <option value="43">HTML / CSS (PlainText)</option>
          </select>

          <button onClick={runCode} disabled={!canEdit} className="bg-gradient-to-b from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 px-4 py-1 rounded-md text-white font-semibold text-sm w-full sm:w-auto">
            Run
          </button>

          {myRole === "owner" && (
            <button
              onClick={handleSaveCode}
              className="bg-gradient-to-b from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 px-4 py-1 rounded-md text-white font-semibold text-sm w-full sm:w-auto"
            >
              Save Code
            </button>
          )}
        </div>
      </div>

      {/* ===== Editor Section ===== */}
      <div className="flex-1 p-2 min-h-[250px] sm:min-h-[400px] md:min-h-[500px]">
        <Editor
          defaultValue="// Start coding collaboratively..."
          theme="vs-dark"
          value={code}
          language={languageMap[language]}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            readOnly: !canEdit,
          }}
          className="rounded-md overflow-hidden h-full"
        />
      </div>

      {/* ===== Input / Output Section ===== */}
      <div className="flex flex-col sm:flex-row w-full gap-3 border-t border-gray-700 p-2 dark:bg-slate-900 text-sm">
        {/* Input */}
        <div className="flex-1 border border-gray-600 rounded-md p-2 flex flex-col">
          <h2 className="font-bold font-mono border-b border-gray-500 mb-1">
            Input
          </h2>
          <textarea
            placeholder="Input here..."
            value={input}
            onChange={handleInputChange}
            disabled={!canEdit}
            className="flex-1 resize-none p-2 rounded-md text-sm overflow-auto dark:text-white dark:bg-slate-700"
          ></textarea>
        </div>

        {/* Output */}
        <div className="flex-1 border border-gray-600 rounded-md p-2 flex flex-col">
          <h2 className="font-bold font-mono border-b border-gray-500 mb-1">
            Output
          </h2>
          <pre className="flex-1 whitespace-pre-wrap overflow-auto p-2 rounded-md text-sm dark:text-white dark:bg-slate-700">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
