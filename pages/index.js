import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import buildspaceLogo from "../assets/buildspace-logo.png";

const Home = () => {
  const maxRetries = 20;
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [img, setImg] = useState("");
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const onKeyChange = (event) => {
    setKey(event.target.value);
  };

  const generateAction = async () => {
    if (isGenerating && retry === 0) return;

    setIsGenerating(true);

    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    const finalInput = input.replace("Vedank Naik", "vedanknaik");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: JSON.stringify({ finalInput, key }),
    });

    const data = await response.json();

    if (response.status === 503) {
      setRetry(data.estimated_time);
      return;
    }

    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      alert(`${data.error} : Please check entered key and try again`);
      setIsGenerating(false);
      return;
    }

    setFinalPrompt(input);
    setInput("");
    setImg(data.image);
    setIsGenerating(false);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(
          `Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`
        );
        setRetryCount(maxRetries);
        return;
      }
      await sleep(retry * 1000);
      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>ImagAInation</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>AI-Powered Art</h1>
          </div>
          <div className="header-subtitle">
            <h2>
              Unleashing the boundless potential of technology to elevate human
              imagination
            </h2>
          </div>
          <div className="prompt-container">
            <input
              placeholder="Enter your imagination"
              className="prompt-box"
              value={input}
              onChange={onChange}
            />
            <input
              placeholder="Enter your write token"
              className="prompt-box"
              value={key}
              onChange={onKeyChange}
            />
            <p className="text">
              Create your <a href="https://huggingface.co">huggingface</a>{" "}
              account and generate write token{" "}
              <a href="https://huggingface.co/settings/tokens">here</a>{" "}
            </p>
            <div className="prompt-buttons">
              <a
                className={
                  isGenerating ? "generate-button loading" : "generate-button"
                }
                onClick={generateAction}
              >
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={finalPrompt} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
