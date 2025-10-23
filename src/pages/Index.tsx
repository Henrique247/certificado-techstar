import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { FileDown, FileImage, QrCode } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeLib from 'qrcode';
import logoTechStar from '@/assets/logo-techstar.webp';
import { generateVerificationCode, formatDateInPortuguese, normalizeNameForFilename } from '@/utils/certificateHelpers';

const Index = () => {
  const [participantName, setParticipantName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [name, setName] = useState('');
  const [includeQR, setIncludeQR] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      toast.error('Por favor, insira o nome completo do participante.');
      return;
    }

    if (trimmedName.length < 3) {
      toast.error('O nome deve ter pelo menos 3 caracteres.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const code = generateVerificationCode();
      const date = formatDateInPortuguese(new Date());
      
      setParticipantName(trimmedName);
      setVerificationCode(code);
      setIssueDate(date);
      setShowQR(includeQR);
      
      if (includeQR) {
        const verificationUrl = `https://techstar.academy/verify/${code}`;
        const qrDataUrl = await QRCodeLib.toDataURL(verificationUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#0D6EFD',
            light: '#FFFFFF',
          },
        });
        setQrCodeDataUrl(qrDataUrl);
      } else {
        setQrCodeDataUrl('');
      }
      
      setIsGenerated(true);
      
      toast.success('Certificado gerado com sucesso!', {
        description: `Código de verificação: ${code}`,
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Erro ao gerar certificado. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      toast.info('Gerando PDF...', {
        description: 'Por favor, aguarde alguns segundos.',
      });

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `certificado-${normalizeNameForFilename(participantName)}.pdf`;
      pdf.save(fileName);

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;

    try {
      toast.info('Gerando PNG...', {
        description: 'Por favor, aguarde alguns segundos.',
      });

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Erro ao gerar PNG.');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado-${normalizeNameForFilename(participantName)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('PNG baixado com sucesso!');
      }, 'image/png');
    } catch (error) {
      console.error('Error generating PNG:', error);
      toast.error('Erro ao gerar PNG. Tente novamente.');
    }
  };

  const description = `Este certificado é concedido a ${participantName} pela sua valiosa participação no evento "TechStar 100 Experience", realizado pela TechStar Academy.

A celebração marca a conquista dos primeiros 100 membros da comunidade, reconhecendo o compromisso com a inovação, o aprendizado contínuo e o desenvolvimento tecnológico da nova geração.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <img src={logoTechStar} alt="TechStar Academy" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="font-playfair text-2xl font-bold text-foreground">
                TechStar Academy
              </h1>
              <p className="font-poppins text-sm text-muted-foreground">
                Gerador de Certificados
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <section className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <div className="text-center mb-8">
              <h2 className="font-playfair text-3xl font-bold text-foreground mb-2">
                Gerar Certificado de Participação
              </h2>
              <p className="font-poppins text-muted-foreground">
                Evento: TechStar 100 Experience
              </p>
            </div>
            
            <div className="w-full max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="participant-name" className="font-poppins text-base font-medium">
                    Nome Completo do Participante *
                  </Label>
                  <Input
                    id="participant-name"
                    type="text"
                    placeholder="Digite o nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="font-poppins text-base h-12"
                    required
                  />
                  <p className="text-xs text-muted-foreground font-poppins">
                    Este nome aparecerá no certificado
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-primary" />
                    <div>
                      <Label htmlFor="include-qr" className="font-poppins text-sm font-medium cursor-pointer">
                        Incluir QR Code
                      </Label>
                      <p className="text-xs text-muted-foreground font-poppins">
                        Adiciona código de verificação no certificado
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="include-qr"
                    checked={includeQR}
                    onCheckedChange={setIncludeQR}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-poppins text-base font-semibold"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Gerando...' : 'Gerar Certificado'}
                </Button>

                {isGenerated && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <p className="text-sm font-poppins text-muted-foreground text-center">
                      Certificado gerado! Escolha o formato para download:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="h-11 font-poppins"
                        type="button"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Baixar PDF
                      </Button>
                      <Button
                        onClick={handleDownloadPNG}
                        variant="outline"
                        className="h-11 font-poppins"
                        type="button"
                      >
                        <FileImage className="w-4 h-4 mr-2" />
                        Baixar PNG
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </section>

          {isGenerated && (
            <section className="space-y-4">
              <div className="text-center">
                <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">
                  Pré-visualização do Certificado
                </h3>
                <p className="font-poppins text-sm text-muted-foreground">
                  O PDF gerado será idêntico a esta visualização
                </p>
              </div>
              
              <div className="flex justify-center overflow-x-auto py-8">
                <div className="inline-block">
                  <div
                    ref={certificateRef}
                    className="relative w-[1122px] h-[793px] bg-card p-12 rounded-xl shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)',
                      border: '3px double hsl(var(--primary))',
                      boxShadow: '0 20px 60px -15px rgba(13, 110, 253, 0.3), inset 0 0 0 1px rgba(13, 110, 253, 0.1)',
                    }}
                  >
                    <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-gold opacity-60" />
                    <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-gold opacity-60" />
                    <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-gold opacity-60" />
                    <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-gold opacity-60" />

                    <div 
                      className="absolute bottom-24 right-24 w-32 h-32 rounded-full opacity-10"
                      style={{
                        background: 'radial-gradient(circle, hsl(var(--gold)) 0%, transparent 70%)',
                        border: '4px solid hsl(var(--gold))',
                      }}
                    />

                    <div className="relative z-10 flex flex-col items-center justify-between h-full">
                      <div className="flex flex-col items-center gap-4">
                        <img 
                          src={logoTechStar} 
                          alt="TechStar Academy Logo" 
                          className="w-32 h-32 object-contain"
                        />
                        <h1 className="font-playfair text-4xl font-bold text-foreground tracking-wide">
                          Certificado de Participação
                        </h1>
                        <div className="h-1 w-48 bg-gradient-to-r from-transparent via-primary to-transparent" />
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-4xl">
                        <div className="text-center">
                          <p className="font-poppins text-lg text-muted-foreground mb-3">
                            Este certificado é concedido a
                          </p>
                          <h2 className="font-playfair text-6xl font-bold text-primary italic">
                            {participantName}
                          </h2>
                        </div>

                        <div className="text-center px-8">
                          <p className="font-poppins text-base leading-relaxed text-foreground whitespace-pre-line">
                            {description.split(participantName)[1]}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-end justify-between w-full">
                        <div className="w-32">
                          {showQR && qrCodeDataUrl && (
                            <div className="flex flex-col items-center gap-2">
                              <img 
                                src={qrCodeDataUrl} 
                                alt="QR Code de Verificação" 
                                className="w-24 h-24"
                              />
                              <p className="font-poppins text-xs text-muted-foreground">
                                Verificação
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-3">
                          <div className="h-px w-64 bg-border" />
                          <p className="font-poppins text-sm font-semibold text-foreground">
                            Henrique Mendes
                          </p>
                          <p className="font-poppins text-xs text-muted-foreground -mt-2">
                            CEO da TechStar Academy
                          </p>
                          <p className="font-poppins text-sm text-muted-foreground mt-2">
                            {issueDate}
                          </p>
                        </div>

                        <div className="w-32 text-right">
                          <p className="font-poppins text-xs text-muted-foreground mb-1">
                            Código de Verificação:
                          </p>
                          <p className="font-mono text-sm font-semibold text-primary">
                            {verificationCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="bg-card/80 backdrop-blur-sm border-t border-border mt-20">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center font-poppins text-sm text-muted-foreground">
            © 2025 TechStar Academy. Sistema de geração de certificados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
