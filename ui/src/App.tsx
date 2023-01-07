/** @jsxRuntime classic */
/** @jsx jsx */

import React, { useState } from "react";
import { css, jsx } from "@emotion/react";
import { useForm } from "react-hook-form";
import { tsv2json } from "tsv-json";
import { annotationOutputName, PairScreener } from "./components/PairScreener";

export interface ImageWordPair {
  word: string;
  path: string;
}

function App() {
  const localStorageAnnotationCount =
    JSON.parse(localStorage.getItem(annotationOutputName) || "[]")?.length || 0;
  const [dataSet, setDataSet] = useState<Record<string, ImageWordPair>>({});
  const [showUpload, setShowUpload] = useState(true);
  const { register, handleSubmit } = useForm();
  const [annotationCount, setAnnotationCount] = useState(
    localStorageAnnotationCount
  );

  const handleSubmitForm = () => {
    setShowUpload(false);
  };

  const onImagePairsFileUpload = (event: any) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const datasetMap: Record<string, any> = {};
      tsv2json(text).forEach((pair: any) => {
        datasetMap[pair[1]] = { word: pair[0], path: pair[1] };
      });
      setDataSet(datasetMap);
    };
    reader.readAsText(event.target.files[0]);
  };

  const onSessionFileUpload = (event: any) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      localStorage.setItem(annotationOutputName, text);
      setAnnotationCount(JSON.parse(text)?.length || 0);
    };
    reader.readAsText(event.target.files[0]);
  };

  return (
    <div>
      {showUpload ? (
        <div
          css={{ display: "flex", justifyContent: "center", marginTop: "3em" }}
        >
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <div
              css={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "600px",
                gap: "1em",
              }}
            >
              <label htmlFor="imagePairsFile">
                Upload image word pairs .tsv file
              </label>
              <input
                {...register("imagePairsFile")}
                type="file"
                name="imagePairsFile"
                onChange={onImagePairsFileUpload}
                css={{ marginBottom: "2em" }}
              />
              <label htmlFor="sessionFile">
                Upload previous session .json file. (Currently stored items:{" "}
                {annotationCount})
                <br />
                NOTE: if you upload a previous file, all non-saved annotation
                from the current session will be overwritten.
              </label>
              <input
                {...register("sessionFile")}
                type="file"
                name="sessionFile"
                onChange={onSessionFileUpload}
              />
              <button css={{ maxWidth: "200px" }}>Submit</button>
            </div>
          </form>
        </div>
      ) : (
        <PairScreener pairsMap={dataSet} />
      )}
    </div>
  );
}

export default App;
