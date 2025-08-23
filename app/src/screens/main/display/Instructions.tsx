import illustration from '../../../assets/illustration-green.png';

export function Instructions() {
    return (
        <div className="bg-emerald-800 flex flex-col justify-center items-center h-full rounded-lg">
            <img src={illustration} alt="Angebot Illustration" />
        </div>
    );
}