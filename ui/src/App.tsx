import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { tsv2json } from "tsv-json";
import { ExportItem, PairScreener } from "./components/PairScreener";

export interface ImageWordPair {
  word: string;
  path: string;
}

function App() {
  const [dataSet, setDataSet] = useState<Record<string, ImageWordPair>>({});

  const [showUpload, setShowUpload] = useState(true);
  const { register, handleSubmit } = useForm();

  const onSubmit = (event: any) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const datasetMap: Record<string, any> = {};
      tsv2json(text).forEach((pair: any) => {
        datasetMap[pair[1]] = { word: pair[0], path: pair[1] };
      });
      setDataSet(datasetMap);
      setShowUpload(false);
    };
    reader.readAsText(event.target.files[0]);
  };

  return (
    <div>
      {showUpload && !Object.keys(dataSet).length ? (
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("imageDataFile")}
              type="file"
              name="picture"
              onChange={onSubmit}
            />
            <button>Submit</button>
          </form>
        </div>
      ) : (
        <PairScreener pairsMap={dataSet} />
      )}
    </div>
  );
}

export default App;
