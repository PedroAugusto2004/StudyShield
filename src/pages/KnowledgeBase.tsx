import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Trash2, 
  Download,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Document {
  id: number;
  name: string;
  size: string;
  type: string;
  uploadDate: Date;
  status: 'processed' | 'processing' | 'error';
}

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const documents = useMemo<Document[]>(() => {
    const now = Date.now();
    return [
      {
        id: 1,
        name: "Calculus_Notes.pdf",
        size: "2.4 MB",
        type: "PDF",
        uploadDate: new Date(now - 86400000),
        status: 'processed'
      },
      {
        id: 2,
        name: "Physics_Formulas.docx",
        size: "1.2 MB",
        type: "DOCX",
        uploadDate: new Date(now - 172800000),
        status: 'processed'
      },
      {
        id: 3,
        name: "Chemistry_Lab_Report.pdf",
        size: "3.1 MB",
        type: "PDF",
        uploadDate: new Date(now - 259200000),
        status: 'processing'
      },
      {
        id: 4,
        name: "History_Timeline.txt",
        size: "45 KB",
        type: "TXT",
        uploadDate: new Date(now - 345600000),
        status: 'processed'
      }
    ];
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Handle file drop logic here
    const fileCount = e.dataTransfer.files.length;
    console.log(`Files dropped: ${fileCount} file(s)`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-success';
      case 'processing': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed': return 'Ready';
      case 'processing': return 'Processing...';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-card-border/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="glass-card hover:bg-card-glass/60"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
              <p className="text-muted-foreground mt-1">
                Upload and manage your study materials
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="glass-card hover:bg-card-glass/60"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Card */}
            <Card 
              className="glass-card border-2 border-dashed border-card-border/50 bg-gradient-to-br from-card-glass/40 to-card/20 backdrop-blur-xl hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Study Materials</h3>
                <p className="text-muted-foreground mb-6">
                  Drag and drop your files here, or click to browse
                </p>
                <Button className="btn-primary-glass">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports PDF, DOCX, TXT, and more • Max 10MB per file
                </p>
              </CardContent>
            </Card>

            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-card bg-input/50 border-input-border/50 focus:border-primary/50 focus:ring-primary/20"
                  placeholder="Search documents..."
                />
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="glass-card-hover border-card-border/50 bg-gradient-to-br from-card-glass/80 to-card/60 backdrop-blur-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {doc.size} • {doc.type} • {doc.uploadDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${getStatusColor(doc.status)}`}>
                          {getStatusText(doc.status)}
                        </span>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 hover:bg-card-glass/60"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Storage Stats */}
            <Card className="glass-card border-card-border/50 bg-gradient-to-br from-card-glass/80 to-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg">Storage Usage</CardTitle>
                <CardDescription>Your knowledge base statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used</span>
                    <span className="font-semibold">6.7 MB / 100 MB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: '6.7%' }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{documents.length}</div>
                    <div className="text-xs text-muted-foreground">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">3</div>
                    <div className="text-xs text-muted-foreground">File Types</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-card-border/50 bg-gradient-to-br from-card-glass/80 to-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full btn-glass justify-start"
                  onClick={() => navigate('/chat')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ask AI about documents
                </Button>
                <Button className="w-full btn-glass justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk upload
                </Button>
                <Button className="w-full btn-glass justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export all
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KnowledgeBase;