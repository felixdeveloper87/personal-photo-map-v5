package com.personalphotomap.service;

import com.personalphotomap.model.Album;
import com.personalphotomap.model.Image;
import com.personalphotomap.repository.AlbumRepository;
import com.personalphotomap.repository.ImageRepository;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class ImageDeleteService {

    private final LocalFileStorageService localFileStorageService;
    private final ImageRepository imageRepository;
    private final AlbumRepository albumRepository;

    public ImageDeleteService(LocalFileStorageService localFileStorageService, ImageRepository imageRepository, AlbumRepository albumRepository) {
        this.localFileStorageService = localFileStorageService;
        this.imageRepository = imageRepository;
        this.albumRepository = albumRepository;
    }

    /**
     * Synchronously deletes an image and removes it from all albums.
     * Use this method when called from within a transaction.
     * 
     * @param image The image to delete
     */
    public void deleteImageSync(Image image) {
        // First, remove the image from all albums
        List<Album> albums = albumRepository.findByImageId(image.getId());
        for (Album album : albums) {
            if (album.getImages().removeIf(img -> img.getId().equals(image.getId()))) {
                if (album.getImages().isEmpty()) {
                    albumRepository.delete(album);
                } else {
                    albumRepository.save(album);
                }
            }
        }
        
        // Flush to ensure album changes are persisted before deleting the image
        albumRepository.flush();

        // Delete the physical file
        localFileStorageService.deleteFile(image.getFilePath());
        
        // Finally, delete the image entity
        imageRepository.delete(image);
    }

    @Async
    public CompletableFuture<Void> deleteImage(Image image) {
        try {
            deleteImageSync(image);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }

    public void deleteImagesInParallel(List<Image> images) {
        List<CompletableFuture<Void>> futures = images.stream()
                .map(this::deleteImage)
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }
}
