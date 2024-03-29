import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import './ResizableDraggableBox.css';

function ResizableDraggableBox() {
  const [boxes, setBoxes] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
  const containerRef = useRef(null);

  const addBox = () => {
    const newBox = {
      id: boxes.length,
      size: { width: 200, height: 200 },
      position: { x: 50 * boxes.length, y: 50 * boxes.length },
      enableResizing: false,
      enableDragging: false,
    };
    setBoxes([...boxes, newBox]);
  };
  const toggleResizing = (id) => {
    setBoxes(boxes.map(box => box.id === id ? { ...box, enableResizing: !box.enableResizing } : box));
  };

  const toggleDragging = (id) => {
    setBoxes(boxes.map(box => box.id === id ? { ...box, enableDragging: !box.enableDragging } : box));
  };

  const updateViewport = () => {
    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      setViewport({
        x: -left / zoom,
        y: -top / zoom,
        width: window.innerWidth / zoom,
        height: window.innerHeight / zoom
      });
    }
  };
  
  useEffect(() => {
    const handleResize = () => updateViewport();
    window.addEventListener('resize', handleResize);
    updateViewport();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [zoom]);

  const handleZoom = (newZoom, centerX, centerY) => {
    setBoxes(boxes.map(box => {
      const scaleRatio = newZoom / zoom;
      const boxCenterX = box.position.x + (box.size.width * zoom) / 2;
      const boxCenterY = box.position.y + (box.size.height * zoom) / 2;

      const newX = (boxCenterX - centerX) * scaleRatio + centerX;
      const newY = (boxCenterY - centerY) * scaleRatio + centerY;

      return {
        ...box,
        position: { x: newX - (box.size.width * newZoom) / 2, y: newY - (box.size.height * newZoom) / 2 }
      };
    }));
    setZoom(newZoom);
    updateViewport();
  };
  const handleZoomIn = () => {
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    handleZoom(Math.min(3, zoom + 0.1), centerX, centerY);
  };

  const handleZoomOut = () => {
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    handleZoom(Math.max(0.1, zoom - 0.1), centerX, centerY);
  };

  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const newZoom = event.deltaY > 0 ? Math.max(0.1, zoom - 0.1) : Math.min(3, zoom + 0.1);
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      handleZoom(newZoom, mouseX, mouseY);
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', updateViewport);
    updateViewport();

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', updateViewport);
    };
  }, [zoom, boxes]);

  const minimapScale = 0.1; // Adjust this scale factor based on your actual minimap size and main canvas size



  // Render
  return (
    <div className="canvas-container" ref={containerRef}>
      {boxes.map(box => (
        <Rnd
          key={box.id}
          size={{ width: box.size.width * zoom, height: box.size.height * zoom }}
          position={box.position}
          onDragStop={(e, d) => setBoxes(boxes.map(b => b.id === box.id ? { ...b, position: { x: d.x, y: d.y } } : b))}
          onResizeStop={(e, direction, ref, delta, position) => {
            setBoxes(boxes.map(b => b.id === box.id ? { ...b, size: { width: ref.offsetWidth / zoom, height: ref.offsetHeight / zoom }, position } : b));
          }}
          enableResizing={box.enableResizing}
          disableDragging={!box.enableDragging}
          style={{ transform: `scale(${zoom})` }}
        >
          <div className="box-content">
            Drag me! Resize me!
          </div>
          <div className="lock-buttons">
            <FontAwesomeIcon icon={box.enableResizing ? faUnlock : faLock} onClick={() => toggleResizing(box.id)} color={box.enableResizing ? 'green' : 'red'} />
            <FontAwesomeIcon icon={box.enableDragging ? faUnlock : faLock} onClick={() => toggleDragging(box.id)} color={box.enableDragging ? 'green' : 'red'} />
          </div>
        </Rnd>
      ))}
      <div className="control-buttons">
        <button onClick={addBox}><FontAwesomeIcon icon={faPlus} /></button>
        <button onClick={handleZoomIn}><FontAwesomeIcon icon={faPlus} /></button>
        <button onClick={handleZoomOut}><FontAwesomeIcon icon={faMinus} /></button>
      </div>
      <div className="minimap" style={{ position: 'absolute', bottom: 0, right: 0, width: '200px', height: '200px', border: '1px solid black', backgroundColor: '#eee' }}>
        {boxes.map(box => (
          <div
            key={box.id}
            style={{
              position: 'absolute',
              width: box.size.width *  minimapScale,
              height: box.size.height *  minimapScale,
              left: box.position.x *  minimapScale,
              top: box.position.y * minimapScale,
              border: '1px solid blue',
              backgroundColor: 'rgba(0, 0, 255, 0.2)'
            }}
          />
        ))}
        <div style={{
          position: 'absolute',
          border: '2px dashed red',
          left: viewport.x * minimapScale,
          top: viewport.y * minimapScale,
          width: viewport.width * minimapScale,
          height: viewport.height * minimapScale
        }} />
      </div>
    </div>
  );
}

export default ResizableDraggableBox;
