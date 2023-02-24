import D3text from "./D3text";
import D3model from "./D3model";
import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import Controls from "@/Tools/Controls";
import useUpdateControlValues from "@/Hooks/useUpdateControlValues";

let clickAway = false;

const Model = ({ props }) => {
  const { model, textProps, files, guiControls } = props;
  const [selectedObject, setSelectedObject] = useState(null);

  const transform = useRef();

  const {
    gl: { domElement },
  } = useThree();

  // hide transform and gui controls
  const closeControls = () => {
    guiControls.current.style.visibility = "hidden";
    setSelectedObject(null);
  };

  const { color, metalness, roughness } = useUpdateControlValues(closeControls);

  useEffect(() => {
    closeControls();
    // listeners
    domElement.addEventListener("click", canvasClickListener);
    // cleanup for listeners
    return () => {
      domElement.removeEventListener("click", canvasClickListener);
    };
  }, []);

  useEffect(() => {
    if (!selectedObject) return;
    let mat = selectedObject.material;
    mat.color.set(color);
    mat.roughness = roughness;
    mat.metalness = metalness;
  }, [color, metalness, roughness]);

  // click away listener for transform controls
  const canvasClickListener = () => {
    if (clickAway) {
      closeControls();
      clickAway = !clickAway;
    }
  };

  // three render loop
  useFrame((state) => {
    // click away listener for transform controls
    let children = [model.current];
    transform.current?.children[0].traverse((kid) => {
      if (kid.type === "Mesh") children.push(kid);
    });

    let intersectsTrans = state.raycaster.intersectObjects(children);
    if (intersectsTrans.length > 0) {
      clickAway = false;
    } else {
      clickAway = true;
    }
  });

  return (
    <>
      <object3D ref={model} onClick={(e) => setSelectedObject(e.object)}>
        <D3text {...textProps} metalness=".8" roughness="0" />
        {files.length &&
          files.map((file) => (
            <D3model key={file.name} props={{ file, model }} />
          ))}
        {/* <Box bumpMap={texture}/> */}
      </object3D>
      \
      <Controls
        ref={transform}
        selectedObject={selectedObject}
        closeControls={closeControls}
        guiControls={guiControls}
      />
    </>
  );
};

export default Model;
