import os
# ChromaDB requires sqlite3 >= 3.35. Render's default image might have an older version.
# This hack swaps the system sqlite3 with pysqlite3-binary.
try:
    __import__('pysqlite3')
    import sys
    sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
except ImportError:
    pass

import chromadb
import google.generativeai as genai
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from chromadb.utils import embedding_functions

# Ensure GOOGLE_API_KEY is set in environment or passed
# genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

class GoogleGenerativeAIEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input: chromadb.Documents) -> chromadb.Embeddings:
        # Gemini embedding model
        model = "models/embedding-001"
        embeddings = []
        for text in input:
            response = genai.embed_content(model=model, content=text, task_type="retrieval_document")
            embeddings.append(response['embedding'])
        return embeddings

class RAGEngine:
    def __init__(self, persist_directory="./chroma_db"):
        self.persist_directory = persist_directory
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # We will initialize the collection lazily or check if it exists
        # We need the API key to be set before we can use the embedding function
        self.collection = None

    def _get_collection(self):
        if self.collection is None:
            # Create embedding function wrapper
            ef = GoogleGenerativeAIEmbeddingFunction()
            self.collection = self.client.get_or_create_collection(name="exam_prep", embedding_function=ef)
        return self.collection

    def process_pdf(self, file_path: str, metadata: dict = None):
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text)
        
        collection = self._get_collection()
        
        # Add to Chroma
        ids = [f"{metadata.get('source', 'doc')}_{i}" for i in range(len(chunks))]
        metadatas = [metadata or {} for _ in chunks]
        
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
            
    def search(self, query: str, k: int = 5):
        collection = self._get_collection()
        
        # Embed query
        # The embedding function in collection will handle it, but we need to make sure it uses the query task type if possible
        # Chroma's embedding function interface doesn't easily support changing task type per call
        # So we rely on the default implementation in GoogleGenerativeAIEmbeddingFunction
        
        results = collection.query(
            query_texts=[query],
            n_results=k
        )
        
        return results['documents'][0] # Returns list of list of documents

rag_engine = RAGEngine()
