import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FormElement } from "@/types";
import { FormElementEditor } from "./FormElementEditor";

interface CanvasProps {
  elements: FormElement[];
  onElementUpdate: (index: number, element: FormElement) => void;
  onElementDelete: (index: number) => void;
  onDragEnd: (result: DropResult) => void;
}

export function Canvas({
  elements,
  onElementUpdate,
  onElementDelete,
  onDragEnd,
}: CanvasProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="canvas">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {elements.map((element, index) => (
              <Draggable
                key={`${element.type}-${index}`}
                draggableId={`${element.type}-${index}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <FormElementEditor
                      element={element}
                      index={index}
                      onUpdate={(updatedElement) =>
                        onElementUpdate(index, updatedElement)
                      }
                      onDelete={() => onElementDelete(index)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}