import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import Xarrow from "react-xarrows";
import useMyStore from "../../contexts/projectContext";
import { shallow } from "zustand/shallow";
import MessageBox from "./Message";
import EvaluationBox from "./Evaluation";
import { useUserAuth } from "../../authentication/UserAuthContext";
import { Rnd } from "react-rnd";

const ConnectPointsWrapper = ({ cardId, dragRef, cardRef }) => {
  const ref1 = useRef();
  const [position, setPosition] = useState({});
  const [beingDragged, setBeingDragged] = useState(false);

  return (
    <>
      <div
        className="connectPoint top-[calc(50%-7.5px)] right-1 absolute w-2 h-2 rounded-full bg-black"
        style={{ ...position }}
        draggable
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={(e) => {
          setBeingDragged(true);
          e.dataTransfer.setData("arrow", cardId);
        }}
        onDrag={(e) => {
          const { offsetTop, offsetLeft } = cardRef.current;
          const { x, y } = dragRef.current.state;
          setPosition({
            position: "fixed",
            left: e.clientX - x - offsetLeft,
            top: e.clientY - y - offsetTop,
            transform: "none",
            opacity: 0,
          });
        }}
        ref={ref1}
        onDragEnd={() => {
          setPosition({});
          setBeingDragged(false);
        }}
      />
      {beingDragged && (
        <Xarrow
          path="straight"
          start={cardId}
          startAnchor={"right"}
          end={ref1}
          color="#9CAFB7"
        />
      )}
    </>
  );
};

const colorClasses = {
  problem: "problem",
  task: "task",
  data: "data",
  model: "model",
  train: "train",
  test: "test",
  deploy: "deploy",
  design: "design",
  develop: "develop",
  modelEvaluation: "modelEva",
  modelDevelopment: "modelDev",
  MLOps: "MLOps",
  feedback: "feedback",
  problemDef: "problemDef",
  "➕": "➕",
};

const getBorderColorClassFromId = (stage) => {
  return `border-${colorClasses[stage]}`;
};

const getBgColorClassFromId = (stage) => {
  const bgColorClass = `bg-${colorClasses[stage]}`;
  return bgColorClass;
};

export default function Card({ id, stage, handleDelete, text, comments, cardId }) {
  const { user } = useUserAuth();
  const borderColorClass = getBorderColorClassFromId(id);
  const bgColorClass = getBgColorClassFromId(stage);
  const cardData = useMyStore((store) => store.cards.find((cardData) => cardData.uid === id), shallow);
  const evaluationData = useMyStore((store) => store.evaluations.filter((evaluation) => evaluation.cardId === cardId), shallow);

  const prompt = cardData ? cardData.prompt : "No prompt available";
  const setCardPosition = useMyStore((store) => store.setCardPosition);
  const dragRef = useRef();
  const cardRef = useRef();
  const { setCardSize } = useMyStore(state => ({
    setCardSize: state.setCardSize
  }));
  
  const [size, setSize] = useState({ width: 200, height: 200 }); // Initial size of the card
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Initial position of the card
  
  
  const renderStageNameTrigger = () => (
    <div className={`${bgColorClass} p-1 py-0 rounded text-center`}>
      {stage.charAt(0).toUpperCase() + stage.slice(1)}
    </div>
  );

  const handleStop = (event, dragElement) => {
    setCardPosition(dragElement.node.id, {
      x: dragElement.x,
      y: dragElement.y,
    });
  };

  const addLink = useMyStore((store) => store.addLink);
  const addComment = useMyStore((store) => store.addComment);

  const refreshLinks = useMyStore((store) => store.refreshLinks);

  const handleTextChange = (newText) => {
    useMyStore.getState().setCardDescription(cardId, newText);
  };

  const [showSmallCommentBox] = useState(true);
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <Rnd
      ref={dragRef}
      size={cardData.size}
      position={cardData.position}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
        handleStop(e, d);
        refreshLinks();
      }}
//      onResizeStop={(e, direction, ref, delta, position) => {
//        setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
//        setPosition(position);
//      }}

      onResizeStop={(e, direction, ref, delta, position) => {
        const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
        setSize(newSize);
        setPosition(position);
        setCardSize(cardId, newSize); // Assuming cardId is available in this context
      }}
      
      enableResizing={{
        top:true, right:true, bottom:true, left:true, topRight:true, bottomRight:true, bottomLeft:true, topLeft:true
      }}
    >
      <div
        className={`absolute bg-gray-200 rounded shadow p-2 ${showComments ? "" : "min-h-[100px]"} `}
        id={id}
        ref={cardRef}
        style={{ paddingBottom: "0" }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          if (e.dataTransfer.getData("arrow") !== cardId) {
            addLink({ start: e.dataTransfer.getData("arrow"), end: id });
          }
        }}
      >
        <button
          onClick={() => handleDelete(id, cardId)}
          className="absolute top-0 right-0 text p-1"
        >
          ❌
        </button>
        <div className={`absolute top-1 left-1 flex flex-row items-center`}>
          {renderStageNameTrigger()}
          {evaluationData.length !== 0 && (
            <button
              className="ml-1 bg-red-500 px-1.5 py-0 rounded text-white text-sm"
              onClick={() => { setShowComments(true); refreshLinks(); }}
            >
              {evaluationData.length}
            </button>
          )}
        </div>

        <ConnectPointsWrapper cardId={id} dragRef={dragRef} cardRef={cardRef} />

        <div className="mt-4 flex flex-row">
          <div className={`pr-2 ${showComments && "vertical-line-container"}`}>
            {showPrompt && (
              <div className="flex flex-col w-60">
                <div className="p-3 bg-gray-100">{prompt}</div>
              </div>
            )}
            <textarea
              className="p-3 mt-2 w-60"
              value={text}
              onChange={(e) => handleTextChange(e.target.value, id)}
              onClick={() => setShowPrompt(!showPrompt)}
              placeholder="Describe this stage..."
            />
            <div className="text-lg mt-2 ">
              <button
                className="pr-1"
                onClick={() => setShowComments(!showComments)}
              >
                💬
              </button>
            </div>
          </div>

          {showComments && (
            <div className="pl-2 w-48 text-sm">
              <div className="overflow-y-auto overflow-x-hidden max-h-80 h-100">
                {comments.map((comment) => (
                  <MessageBox key={comment.uid} commentId={comment.uid} {...comment} />
                ))}
                {evaluationData.map((evaluation) => (
                  <EvaluationBox key={evaluation.id} evaluationData={evaluation} />
                ))}
              </div>
              <div className="absolute bottom-2 h-max flex flex-row items-center rounded-3">
                <input
                  type="text"
                  className="w-full rounded-3 p-1"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter Comment"
                />
                <button
                  onClick={() => {
                    addComment(user.displayName, id, commentText);
                    setCommentText("");
                  }}
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
}
