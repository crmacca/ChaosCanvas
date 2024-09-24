import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col p-[5vw]">
            <div className="flex flex-col md:flex-row items-center gap-2">
                <img alt='ChaosCanvas AI generated logo' src={'logo512.png'} className="w-40 h-40" />
                <div className="flex flex-col font-inter">
                    <h1 className="text-4xl font-regular">
                        ChaosCanvas
                    </h1>
                    <h1 className="text-3xl font-light">
                        An Error Occured
                    </h1>
                </div>
            </div>
            
            <button onClick={() => {
                navigate('/')
            }} className="rounded-xl p-3 border border-gray-200 transition hover:bg-gray-200 flex items-center gap-2 max-w-fit mt-5">
                <FontAwesomeIcon icon={faArrowLeft} />
                Return to Canvas
            </button>
        </div>
    );
}

export default ErrorPage