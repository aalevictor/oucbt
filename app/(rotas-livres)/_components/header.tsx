import Image from "next/image";
import Link from "next/link";

export default function Header() {    
    return (
        <header className="relative top-0 left-0 w-full z-50">
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/banner.png')"
                }}
            />
            <div className="relative z-10 flex justify-between items-center p-8 gap-4">
                <Link href="https://www.prefeitura.sp.gov.br/" target="_blank">
                    <Image
                        src="/prefeitura/logo-dark.png"
                        alt="Prefeitura de São Paulo"
                        className="hidden md:block md:w-64 h-auto"
                        width={900}
                        height={290}
                    />
                    <Image
                        src="/prefeitura/brasao.png"
                        alt="Prefeitura de São Paulo"
                        className="md:hidden w-36 h-auto"
                        width={900}
                        height={290}
                    />
                </Link>
                <Link 
                    href="https://gestaourbana.prefeitura.sp.gov.br/estruturacao-territorial/operacoes-urbanas/oucbt/"
                    className="text-white text-lg md:text-2xl font-bold text-center md:text-right md:max-w-[50%]"
                    target="_blank"
                >
                    Operação Urbana Consorciada Bairros do Tamanduateí
                </Link>
            </div>
        </header>
    )
}